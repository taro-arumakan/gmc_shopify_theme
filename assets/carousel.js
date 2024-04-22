class Carousel extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.blocks = this.querySelectorAll(".carousel--block")),
      (this.container = this.querySelector(".carousel--x-container")),
      (this.dot_nav = this.querySelector(".carousel--dot-nav")),
      (this.dots = this.querySelectorAll(".carousel--dot")),
      (this.height_container = this.querySelector(".carousel--y-container")),
      (this.links = this.container && this.container.querySelectorAll("a")),
      (this.next = this.querySelector(".carousel--next")),
      (this.prev = this.querySelector(".carousel--prev")),
      (this.auto_rotate = "true" === this.getAttribute("data-auto-rotate")),
      (this.blocks_per_slide_desktop = parseInt(
        this.getAttribute("data-blocks-per-slide")
      )),
      (this.blocks_per_slide_mobile = parseInt(
        this.getAttribute("data-blocks-per-slide--mobile")
      )),
      (this.total_slides_desktop = parseInt(getComputedStyle(this).getPropertyValue('--total-slides'))),
      (this.total_slides_mobile = parseInt(getComputedStyle(this).getPropertyValue('--total-slides-mobile'))),
      (this.dot_nav_enabled = "true" === this.getAttribute("data-dot-nav")),
      (this.rotate_frequency = parseInt(
        this.getAttribute("data-rotate-frequency")
      )),
      (this.section_id =
        this.closest("[data-section-id]").getAttribute("data-section-id")),
      (this.total_blocks = this.blocks.length),
      (this.transition_type = this.getAttribute("data-transition-type")),
      (this.active_slide = 1),
      (this.autoplay_focus_enabled = !1),
      (this.dot_offset = 0),
      (this.dot_width = 12),
      (this.slide_pause = !1),
      (this.container_destination = "0px"),
      (this.trailing_dot_index = 0),
      (this.leading_dot_index = 0),
      (this.dot_nav_offset = 0),
      (this.active_blocks = null),
      (this.auto_slide_timer = null),
      (this.blocks_per_slide = null),
      (this.old_active_blocks = null),
      (this.screen_size_loaded = null),
      (this.slide_count = null),
      (this.swipe_state = null),
      (this.carousel_width = null),
      (this.dot_change_type = null),
      this.load();
  }
  disconnectedCallback() {
    this.auto_rotate &&
      this.auto_slide_timer &&
      clearInterval(this.auto_slide_timer);
  }
  load() {
    this.initNewScreenSize(),
      this.updateActive(),
      this.resizeObservers(),
      this.getAllFocusableEl(),
      this.mouseDownListener(),
      this.swipeListener(),
      this.arrowNavListeners(),
      "slide" === this.transition_type && this.loadBlocks(),
      Shopify.designMode && (this.blockListener(), this.sectionListener()),
      this.auto_rotate &&
        (this.autoSlide(), this.stopAutoSlideWhenInteracting()),
      this.setSliderHeight(),
      this.active_blocks.forEach((t) => {
        var i = t.querySelector(".featured-video"),
          e =
            (i &&
              i.on("theme:video:loaded", () => this.setSliderHeight(), {
                once: !0,
              }),
            t.querySelector("img"));
        e &&
          !e.complete &&
          e.on("load", () => this.setSliderHeight(), { once: !0 });
      }),
      this.trigger("loaded");
  }
  initNewScreenSize() {
    if ("small" === theme.mqs.current_window) {
      if ("small" === this.screen_size_loaded) return;
      this.dot_nav.setAttribute("data-loaded", !1),
        (this.screen_size_loaded = "small"),
        (this.blocks_per_slide = this.blocks_per_slide_mobile),
        (this.total_slides = this.total_slides_mobile),
        (this.active_slide = Math.ceil(
          (this.blocks_per_slide_mobile * (this.active_slide - 1) + 1) /
            this.blocks_per_slide_mobile
        ));
    } else {
      if ("medium-large" === this.screen_size_loaded) return;
      (this.screen_size_loaded = "medium-large"),
        (this.blocks_per_slide = this.blocks_per_slide_desktop),
        (this.total_slides = this.total_slides_desktop),
        (this.active_slide = Math.ceil(
          (this.blocks_per_slide_desktop * (this.active_slide - 1) + 1) /
            this.blocks_per_slide_desktop
        ));
    }
    (this.dot_change_type = "init"),
      (this.slide_count = Math.ceil(this.total_blocks / this.blocks_per_slide)),
      this.createDotNav(),
      this.goToActiveSlide(),
      this.updateActiveDot();
  }
  getAllFocusableEl() {
    this.focusable_el = theme.a11y.getFocusableEl(this);
  }
  loadBlocks() {
    this.blocks.forEach((t) => {
      t.setAttribute("data-loaded", !0),
        t.setAttribute("data-loaded--mobile", !0);
    });
  }
  blockListener() {
    this.blocks.on("theme:block:select", (t) => {
      var i = Math.ceil((t.target.index() + 1) / this.blocks_per_slide);
      this.updateThenGoToActiveSlide(i, !0);
    });
  }
  sectionListener() {
    this.closest("[data-section-id]").on(
      "theme:section:load",
      () => (this.style.opacity = 1)
    );
  }
  checkForActiveModel(t) {
    var i = t.querySelector("model-viewer");
    return !!i && !i.classList.contains("shopify-model-viewer-ui__disabled");
  }
  mouseDownListener() {
    this.container.on(
      "mousedown touchstart",
      (t) => {
        if (!(t.touches && 1 < t.touches.length)) {
          var i,
            e = t.target.closest(".carousel--block");
          if (e && this.checkForActiveModel(e)) return !1;
          (this.swipe_state = "swipe-started"),
            this.reenableClickAfterSwiping(),
            this.mouseUpListener(),
            (this.slide_pause = !0),
            "slide" === this.transition_type &&
              ((this.drag_start = (
                "touchstart" === t.type ? t.targetTouches[0] : t
              ).pageX),
              (i =
                this.container.style.transform.replace(/[^0-9\-.,]/g, "") /
                100),
              (this.current_transform_pixels =
                this.container.offsetWidth * parseFloat(i)),
              this.container.setAttribute("data-transition-state", ""),
              (this.container.style.transform = `translateX(${this.current_transform_pixels}px)`),
              this.dragBegin());
        }
      },
      { passive: !0 }
    );
  }
  mouseUpListener() {
    window.on(
      `mouseup.${this.section_id} touchend.` + this.section_id,
      (t) => {
        (t.touches && 1 < t.touches.length) ||
          ((this.swipe_state = "swipe-ended"),
          this.removeMouseUpListener(),
          this.dragEnd(),
          !0 === this.slide_pause &&
            (this.container.setAttribute("data-transition-state", "forwards"),
            (this.container.style.transform = `translateX(${this.container_destination})`)));
      },
      { passive: !0 }
    );
  }
  removeMouseUpListener() {
    window.off(`mouseup.${this.section_id} touchend.` + this.section_id);
  }
  dragBegin() {
    this.setAttribute("data-dragging", !0),
      window.on(
        `mousemove.${this.section_id} touchmove.` + this.section_id,
        (i) => {
          if (!(i.touches && 1 < i.touches.length)) {
            var e = ("touchmove" === i.type ? i.targetTouches[0] : i).pageX;
            let t = this.current_transform_pixels - this.drag_start + e;
            var s = this.carousel_width * (this.slide_count - 1);
            0 < t
              ? (this.container.style.transform = `translateX(${t / 4}px)`)
              : t < -1 * s
              ? ((t = s + ((t *= -1) - s) / 4),
                (this.container.style.transform = `translateX(-${t}px)`))
              : (this.container.style.transform = `translateX(${t}px)`);
          }
        },
        { passive: !0 }
      );
  }
  dragEnd() {
    this.setAttribute("data-dragging", !1),
      window.off(`mousemove.${this.section_id} touchmove.` + this.section_id);
  }
  updateContainerDestination() {
    (this.container_destination =
      ((this.active_slide - 1) / this.total_slides) * -100 + "%"),
      (this.container.style.transform = `translateX(${this.container_destination})`);
  }
  slideToNext(t = !1) {
    this.dot_change_type = "iterate";
    let i;
    return (
      this.active_slide !== this.slide_count
        ? (this.updateActive("next"), (i = "forwards"))
        : t && this.active_slide === this.slide_count
        ? ((this.active_slide = 1), this.updateActive(), (i = "forwards"))
        : this.active_slide === this.slide_count && (i = "backwards"),
      this.goToActiveSlide(!0, i),
      !0
    );
  }
  slideToPrev() {
    this.dot_change_type = "iterate";
    let t;
    return (
      1 !== this.active_slide
        ? (this.updateActive("prev"), (t = "forwards"))
        : 1 === this.active_slide && (t = "backwards"),
      this.goToActiveSlide(!0, t),
      !0
    );
  }
  goToActiveSlide(t = !1, i = "forwards") {
    this.active_blocks &&
      this.active_blocks.forEach((t) => theme.transitions.reload(t.dataset.id)),
      t && this.container.setAttribute("data-transition-state", i),
      "slide" === this.transition_type
        ? this.updateContainerDestination()
        : "fade" === this.transition_type && this.fadeSlides(),
      this.old_active_blocks &&
        this.old_active_blocks.forEach((t) =>
          theme.transitions.reset(t.dataset.id)
        );
  }
  checkStartEnd() {
    this.setAttribute("data-at-start", 1 === this.active_slide),
      this.prev &&
        this.prev.setAttribute(
          "tabindex",
          1 === this.active_slide ? "-1" : "0"
        ),
      this.setAttribute("data-at-end", this.active_slide === this.slide_count),
      this.next &&
        this.next.setAttribute(
          "tabindex",
          this.active_slide === this.slide_count ? "-1" : "0"
        );
  }
  updateActive(t = !1) {
    "next" === t
      ? ((this.active_slide += 1),
        (!this.autoplay_focus_enabled && !1 !== this.auto_rotate) ||
          this.prev.focus())
      : "prev" === t &&
        (--this.active_slide,
        (!this.autoplay_focus_enabled && !1 !== this.auto_rotate) ||
          this.next.focus()),
      this.active_blocks && (this.old_active_blocks = this.active_blocks);
    var i = (this.active_slide - 1) * this.blocks_per_slide,
      e = i + this.blocks_per_slide;
    (this.active_blocks = [...this.blocks].slice(i, e)),
      this.toggleFocusableEl(),
      this.checkStartEnd();
  }
  toggleFocusableEl() {
    this.disabled_el &&
      this.disabled_el.forEach((t) => t.setAttribute("tabindex", "0")),
      (this.disabled_el = []),
      this.blocks.not(this.active_blocks).forEach((t) => {
        theme.a11y.getFocusableEl(t).forEach((t) => this.disabled_el.push(t));
      }),
      this.disabled_el.length &&
        this.disabled_el.forEach((t) => t.setAttribute("tabindex", "-1"));
  }
  setSliderHeight() {
    var t = this.active_blocks.map((t) => t.offsetHeight);
    this.height_container.style.height = Math.max(...t) + "px";
  }
  swipeListener() {
    window.on("theme:swipe:left", () => {
      "swipe-started" === this.swipe_state &&
        ((this.slide_pause = !1),
        this.slideToNext(),
        this.setSliderHeight(),
        this.updateActiveDot(),
        this.preventClickWhenSwiping());
    }),
      window.on("theme:swipe:right", () => {
        "swipe-started" === this.swipe_state &&
          ((this.slide_pause = !1),
          this.slideToPrev(),
          this.setSliderHeight(),
          this.updateActiveDot(),
          this.preventClickWhenSwiping());
      });
  }
  createDotNav() {
    if (this.dot_nav_enabled && this.dot_nav && 1 !== this.slide_count) {
      this.dot_nav && (this.dot_nav.innerHTML = "");
      var i = new DocumentFragment();
      for (let t = 0; t < this.slide_count; t++)
        i.append(theme.utils.parseHtml('<div class="carousel--dot"></div>'));
      this.dot_nav.appendChild(i),
        (this.dots = this.dot_nav.querySelectorAll(".carousel--dot")),
        this.dots &&
          (this.dotNavListeners(),
          5 < this.dots.length && this.dotTransitionListener(),
          "small" === theme.mqs.current_window) &&
          this.dots.forEach((t) => t.setAttribute("tabindex", "0"));
    }
  }
  dotNavListeners() {
    this.dots.off(`click.${this.section_id} keydown.` + this.section_id),
      this.dots.on(
        `click.${this.section_id} keydown.` + this.section_id,
        ({ key: t, target: i, type: e }) => {
          ("keydown" === e && "Enter" !== t) ||
            this.updateThenGoToActiveSlide(i.index() + 1, !0);
        }
      );
  }
  dotTransitionListener() {
    this.dots.off("transitionend"),
      this.dots.on("transitionend", ({ target: t }) => {
        t === this.dots[this.active_slide - 1] &&
          (this.dot_nav.style.transform = `translateX(${this.dot_offset}px)`);
      });
  }
  updateActiveDot() {
    this.dots &&
      this.dots.forEach((t) =>
        t.setAttribute("data-active", t === this.dots[this.active_slide - 1])
      ),
      this.dots[this.active_slide - 1] && 5 < this.dots.length
        ? this.updateTrailingLeadingDots()
        : this.dot_nav && this.dot_nav.setAttribute("data-loaded", !0);
  }
  updateTrailingLeadingDots() {
    var t,
      i,
      e = "" !== this.dots[this.active_slide - 1].getAttribute("data-position");
    this.active_slide === this.leading_dot_index
      ? (this.leading_dot_index++,
        this.trailing_dot_index++,
        this.dots.forEach((t) => t.setAttribute("data-position", "")),
        (t = [...this.dots].slice(this.active_slide - 3, this.active_slide)),
        4 <= this.active_slide &&
          (this.dots[this.active_slide - 4].setAttribute(
            "data-position",
            "trailing-1"
          ),
          t.push(this.dots[this.active_slide - 4])),
        5 <= this.active_slide &&
          (this.dots[this.active_slide - 5].setAttribute(
            "data-position",
            "trailing-2"
          ),
          t.push(this.dots[this.active_slide - 5])),
        this.dots.length > this.active_slide &&
          (this.dots[this.active_slide].setAttribute(
            "data-position",
            "leading-1"
          ),
          t.push(this.dots[this.active_slide])),
        this.dots.length > this.active_slide + 1 &&
          (this.dots[this.active_slide + 1].setAttribute(
            "data-position",
            "leading-2"
          ),
          t.push(this.dots[this.active_slide + 1])),
        this.dots
          .not(t)
          .forEach((t) => t.setAttribute("data-position", "hidden")),
        this.moveDots(e),
        "init" === this.dot_change_type &&
          this.dot_nav.setAttribute("data-loaded", !0))
      : this.active_slide === this.trailing_dot_index
      ? (this.leading_dot_index--,
        this.trailing_dot_index--,
        this.dots.forEach((t) => t.setAttribute("data-position", "")),
        (i = [...this.dots].slice(
          this.active_slide - 1,
          this.active_slide + 2
        )),
        2 <= this.active_slide &&
          (this.dots[this.active_slide - 2].setAttribute(
            "data-position",
            "trailing-1"
          ),
          i.push(this.dots[this.active_slide - 2])),
        3 <= this.active_slide &&
          (this.dots[this.active_slide - 3].setAttribute(
            "data-position",
            "trailing-2"
          ),
          i.push(this.dots[this.active_slide - 3])),
        this.dots.length > this.active_slide + 2 &&
          (this.dots[this.active_slide + 2].setAttribute(
            "data-position",
            "leading-1"
          ),
          i.push(this.dots[this.active_slide + 2])),
        this.dots.length > this.active_slide + 3 &&
          (this.dots[this.active_slide + 3].setAttribute(
            "data-position",
            "leading-2"
          ),
          i.push(this.dots[this.active_slide + 3])),
        this.dots
          .not(i)
          .forEach((t) => t.setAttribute("data-position", "hidden")),
        this.moveDots(e),
        "init" === this.dot_change_type &&
          this.dot_nav.setAttribute("data-loaded", !0))
      : "init" === this.dot_change_type
      ? (this.initDotIndices(), this.updateTrailingLeadingDots())
      : this.moveDots(e);
  }
  initDotIndices() {
    this.dots && this.dots.forEach((t) => t.setAttribute("data-position", "")),
      this.slide_count - this.active_slide <= 2
        ? ((this.leading_dot_index = this.active_slide),
          (this.trailing_dot_index = this.active_slide - 3))
        : 2 < this.slide_count - this.active_slide &&
          ((this.trailing_dot_index = this.active_slide),
          (this.leading_dot_index = this.active_slide + 3));
  }
  moveDots(t) {
    this.dot_nav &&
      this.dots &&
      (this.active_slide <= 3
        ? (this.dot_offset = 0)
        : this.active_slide >= this.slide_count - 2
        ? (this.dot_offset = (5 - this.slide_count) * this.dot_width)
        : (this.dot_offset = (3 - this.active_slide) * this.dot_width),
      t || (this.dot_nav.style.transform = `translateX(${this.dot_offset}px)`));
  }
  arrowNavListeners() {
    this.prev &&
      this.prev.on("click keydown", (t) => {
        ("keydown" === t.type && "Enter" !== t.key) ||
          (this.slideToPrev(), this.setSliderHeight(), this.updateActiveDot());
      }),
      this.next &&
        this.next.on("click keydown", (t) => {
          ("keydown" === t.type && "Enter" !== t.key) ||
            (this.slideToNext(),
            this.setSliderHeight(),
            this.updateActiveDot());
        });
  }
  resizeObservers() {
    new ResizeObserver(() => {
      this.carousel_width !== this.offsetWidth &&
        ((this.carousel_width = this.offsetWidth),
        this.initNewScreenSize(),
        this.setSliderHeight(),
        this.moveDots(),
        this.dots) &&
        this.dots.forEach((t) => {
          t.setAttribute(
            "tabindex",
            "small" === theme.mqs.current_window ? "0" : "-1"
          );
        });
    }).observe(this),
      window.on("theme:mqs:updated", () => this.updateActive());
  }
  reenableClickAfterSwiping() {
    this.links.off("click." + this.section_id);
  }
  preventClickWhenSwiping() {
    this.links.on("click." + this.section_id, (t) => t.preventDefault());
  }
  autoSlide() {
    this.auto_slide_timer = setInterval(() => {
      this.slideToNext(!0), this.updateActiveDot(), this.setSliderHeight();
    }, 1e3 * this.rotate_frequency);
  }
  stopAutoSlideWhenInteracting() {
    this.on(
      "click touchstart",
      () => {
        (this.autoplay_focus_enabled = !0),
          clearInterval(this.auto_slide_timer),
          this.off("click touchstart");
      },
      { passive: !0 }
    ),
      this.focusable_el.on(
        "focus",
        () => {
          (this.autoplay_focus_enabled = !0),
            clearInterval(this.auto_slide_timer),
            this.focusable_el.off("focus");
        },
        { passive: !0 }
      );
  }
  fadeSlides() {
    if (null !== this.active_blocks && null !== this.old_active_blocks) {
      this.blocks.forEach((t) => {
        t.setAttribute("data-active", ""),
          t.setAttribute("data-loaded", !1),
          t.setAttribute("data-loaded--mobile", !1);
      }),
        this.old_active_blocks.forEach((t) => {
          t.setAttribute("data-active", "old"), (t.style.left = "0%");
        });
      const e =
        this.total_blocks % this.blocks_per_slide == 0
          ? 0
          : this.blocks_per_slide - (this.total_blocks % this.blocks_per_slide);
      this.active_blocks.forEach((t, i) => {
        t.setAttribute("data-active", "new"),
          (t.style.left = (100 * i) / (this.total_blocks + e) + "%");
      });
    }
  }
  updateThenGoToActiveSlide(t, i = !1) {
    (this.active_slide = t),
      (this.dot_change_type = "init"),
      this.updateActive(),
      this.goToActiveSlide(i),
      this.setSliderHeight(),
      this.initDotIndices(),
      this.updateActiveDot();
  }
}
const carouselEl = customElements.get("carousel-root");
carouselEl || customElements.define("carousel-root", Carousel);
