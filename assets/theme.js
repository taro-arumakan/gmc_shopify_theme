(String.prototype.parse = function (t) {
  var e = new DOMParser().parseFromString(this, "text/html");
  return t ? e.querySelector(t) : e.body.firstElementChild;
}),
  (Element.prototype.trigger = window.trigger =
    function (t, e = null) {
      var i = null == e ? new Event(t) : new CustomEvent(t, { detail: e });
      this.dispatchEvent(i);
    }),
  (Element.prototype.on =
    document.on =
    window.on =
      function (t, e, i) {
        return (
          this.namespaces || (this.namespaces = {}),
          t.split(" ").forEach((t) => {
            (this.namespaces[t] = e),
              this.addEventListener(t.split(".")[0], e, i);
          }),
          this
        );
      }),
  (Element.prototype.off =
    document.off =
    window.off =
      function (t) {
        if (this.namespaces)
          return (
            t.split(" ").forEach((t) => {
              this.removeEventListener(t.split(".")[0], this.namespaces[t]),
                delete this.namespaces[t];
            }),
            this
          );
      }),
  (Element.prototype.index = function () {
    return [...this.parentNode.children].indexOf(this);
  }),
  (Element.prototype.offset = function () {
    var t = this.getBoundingClientRect();
    return { top: t.top + window.scrollY, left: t.left + window.pageXOffset };
  }),
  (Element.prototype.setStyles = function (t = {}) {
    for (var e in t) this.style[e] = t[e];
    return this;
  }),
  (Element.prototype.remove = function () {
    return this.parentNode && this.parentNode.removeChild(this);
  }),
  (NodeList.prototype.on = Array.prototype.on =
    function (t, i, s) {
      this.forEach((e) => {
        e.namespaces || (e.namespaces = {}),
          t.split(" ").forEach((t) => {
            (e.namespaces[t] = i), e.addEventListener(t.split(".")[0], i, s);
          });
      });
    }),
  (NodeList.prototype.off = Array.prototype.off =
    function (t) {
      this.forEach((e) => {
        e.namespaces &&
          t.split(" ").forEach((t) => {
            e.removeEventListener(t.split(".")[0], e.namespaces[t]),
              delete e.namespaces[t];
          });
      });
    }),
  (NodeList.prototype.not = Array.prototype.not =
    function (e) {
      let i = [];
      return (
        e instanceof HTMLElement && (e = [e]),
        this.forEach((t) => {
          [...e].includes(t) || i.push(t);
        }),
        i
      );
    });
class SizeQueries {
  static medium_screen = 768;
  static large_screen = 1024;
  constructor(t, e) {
    (this.element = e), (this.id = t), (this.size = "small"), this.init();
  }
  init() {
    new ResizeObserver(() => this.updateScreenSize()).observe(
      "window" === this.id ? document.body : this.element
    );
  }
  updateScreenSize() {
    var t = this.size,
      e = "window" === this.id ? window.innerWidth : this.element.clientWidth;
    e >= SizeQueries.large_screen
      ? (this.size = "large")
      : e >= SizeQueries.medium_screen
      ? (this.size = "medium")
      : (this.size = "small"),
      this.size !== t && this.element.trigger("theme:mqs:updated");
  }
  static init() {
    [window, HTMLElement.prototype].forEach((t) => {
      Object.defineProperty(t, "sizeQuery", {
        get() {
          return this._sizeQuery ? this._sizeQuery.size : "small";
        },
        set(t) {
          this._sizeQuery || (this._sizeQuery = new SizeQueries(t, this));
        },
      });
    }),
      (window.sizeQuery = "window");
  }
}
SizeQueries.init();
class Utils {
  static disable_prevent_scroll = !1;
  static disable_swipe_listener = !1;
  static scripts = {};
  static links = {};
  static areNumericStrings(...t) {
    return t.every((t) => /^[0-9]+$/.test(t));
  }
  static isValidEmail(t) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(t);
  }
  static scriptLoader(t, e, i) {
    var s;
    void 0 === this.scripts[t]
      ? ((this.scripts[t] = "requested"),
        ((s = document.createElement("script")).src = e),
        (s.onload = () => {
          (this.scripts[t] = "loaded"),
            i && i(),
            window.trigger(`theme:${t}:loaded`);
        }),
        (document.body || document.head).appendChild(s))
      : i && "requested" === this.scripts[t]
      ? window.on(`theme:${t}:loaded`, i)
      : i && "loaded" === this.scripts[t] && i();
  }
  static linkLoader(t, e, i, s) {
    var r;
    this.links[t] ||
      (((r = document.createElement("link")).rel = e),
      (r.href = t),
      s && (r.as = s),
      i && (r.fetchPriority = i),
      document.head.appendChild(r),
      (this.links[t] = r));
  }
  static getFocusableEl(t = !1) {
    var e;
    if (t)
      return (
        (e =
          {
            small:
              ":not([data-mq='medium-large']):not([data-mq='medium']):not([data-mq='large'])",
            medium: ":not([data-mq='small']):not([data-mq='large'])",
            large:
              ":not([data-mq='small-medium']):not([data-mq='small']):not([data-mq='medium'])",
          }[window.sizeQuery] || ""),
        t.querySelectorAll(`
            button:not([disabled]):not([aria-hidden='true']),
            [href]:not(link):not([tabindex='-1'])${e},
            input:not([type='hidden']):not([disabled]):not([aria-hidden='true']),
            select:not([disabled]):not([data-mq='none']):not([aria-hidden='true']),
            textarea:not([disabled]),
            [tabindex]:not([tabindex='-1'])${e}
        `)
      );
  }
  static getStickyOffset() {
    let sticky_offset = getComputedStyle(document.documentElement)
      .getPropertyValue("--sticky-offset")
      .trim();
    return (
      (sticky_offset = sticky_offset
        .replace(/^calc\(|\)$/g, "")
        .replace(/px/g, "")
        .trim()),
      eval(sticky_offset)
    );
  }
  static getQuantity(t, { id: e, management: i, policy: s, quantity: r }, a) {
    if ("shopify" !== i || "continue" === s) return a;
    var o = Cart.basket[e] || 0;
    let n = parseInt(r) - o;
    if (n <= 0) (n = 0), window.trigger(`theme:product:${t}:updateQuantity`, 1);
    else {
      if (!(a > n)) return a;
      window.trigger(`theme:product:${t}:updateQuantity`, n);
    }
    return FeedbackBar.trigger("quantity", n), !1;
  }
  static loadAllTransitions() {
    [...document.querySelectorAll("[data-transition-container]")].map(
      (t) => new Transition(t)
    );
  }
  static updateRecentProducts(t) {
    var e = `${Shopify.theme.name}:recent_products`,
      i = JSON.parse(localStorage.getItem(e) || "[]");
    i.includes(t) ||
      (4 <= i.length && i.shift(),
      i.push(t),
      localStorage.setItem(e, JSON.stringify(i)));
  }
  static arraysEqual(t, e) {
    if (t.length !== e.length) return !1;
    for (let i = 0; i < t.length; i++) if (t[i] !== e[i]) return !1;
    return !0;
  }
}
class Transition {
  constructor(t) {
    (this.container = t),
      (this.observers = []),
      (this.name = this.container.getAttribute("data-transition-container")),
      "" !== this.name && (this.initItems(), this.addListeners());
  }
  initItems() {
    (this.cascade = this.container.getAttribute("data-transition-cascade")),
      "horizontal" === this.cascade && (this.column_counter = 0),
      (this.interval = parseInt(
        this.container.getAttribute("data-transition-cascade-interval")
      )),
      (this.reset =
        null !== this.container.getAttribute("data-transition-reset")),
      (this.trigger = this.container.getAttribute("data-transition-trigger")),
      (this.items = this.findItems()),
      this.items.forEach((t, e) => this.configureItem(t, e));
  }
  findItems() {
    return [
      ...document.querySelectorAll(`[data-transition-item="${this.name}"]`),
    ].filter(
      (t) =>
        !(
          ("small" === window.sizeQuery && "medium-large" === t.dataset.mq) ||
          ("small" !== window.sizeQuery && "small" === t.dataset.mq)
        )
    );
  }
  configureItem(t, e) {
    var i,
      s = t.getAttribute("data-transition-cascade"),
      r = s || this.cascade,
      a = t.getAttribute("data-transition-cascade-interval"),
      o = a ? parseInt(a) : this.interval,
      n = t.getAttribute("data-transition-trigger"),
      h = n || this.trigger;
    r && this.addItemCascade(e, r, o),
      (null !== h && isNaN(parseInt(h))) ||
        ((i =
          null !== this.items[e].getAttribute("data-transition-reset") ||
          this.reset),
        this.addItemObserver(e, i, null === h ? 0.4 : parseInt(h) / 100));
  }
  addItemCascade(t, e, i) {
    var s,
      r,
      a =
        null !== this.items[t].getAttribute("data-transition-cropper")
          ? this.items[t].children[0]
          : this.items[t];
    "horizontal" === e
      ? ((s = this.items[t].offsetTop),
        (r = 0 < t ? this.items[t - 1].offsetTop : s),
        (this.column_counter = 0 < t && s === r ? this.column_counter + 1 : 0),
        a.style.setProperty(
          "--transition--delay",
          `${this.column_counter * i}ms`
        ))
      : "vertical" === e &&
        a.style.setProperty("--transition--delay", `${t * i}ms`);
  }
  addItemObserver(t, i, e) {
    var s = new IntersectionObserver(
      ([{ target: t, isIntersecting: e }]) => {
        e
          ? this.cascade
            ? this.items.forEach((t) => this.setItemState(t, !0))
            : this.setItemState(t, !0)
          : i && this.setItemState(t, !1);
      },
      { threshold: e }
    );
    s.observe(this.items[t]), this.observers.push(s);
  }
  setItemState(t, e) {
    t.setAttribute("data-transition-active", e),
      t.off("transitionend"),
      t.on(
        "transitionend",
        () => t.setAttribute("data-transition-finished", e),
        { once: !0 }
      );
  }
  addListeners() {
    window.off(`theme:transition:reload:${this.name}`),
      window.on(`theme:transition:reload:${this.name}`, () => {
        this.observers.forEach((t) => t.disconnect()),
          (this.observers = []),
          this.resetItems(),
          requestAnimationFrame(() => {
            var t = document.querySelector(
              `[data-transition-container="${this.name}"]`
            );
            new Transition(t);
          });
      }),
      window.off(`theme:transition:reset:${this.name}`),
      window.on(`theme:transition:reset:${this.name}`, () => this.resetItems()),
      window.off(`theme:transition:remove:${this.name}`),
      window.on(`theme:transition:remove:${this.name}`, () => {
        this.observers.forEach((t) => t.disconnect()),
          (this.observers = []),
          this.resetItems();
      }),
      window.off(`theme:mqs:updated.Transition${this.name}`),
      window.on(`theme:mqs:updated.Transition${this.name}`, () =>
        this.initItems()
      );
  }
  resetItems() {
    this.items.forEach((t) => {
      t.setAttribute("data-transition-active", !1),
        t.setAttribute("data-transition-finished", !1);
    });
  }
}
class Drawer extends HTMLElement {
  static status = "closed";
  static disable_swipe_listener = !1;
  constructor() {
    super();
  }
  connectedCallback() {
    (this.close_button = document.querySelector(
      ".layout--navigation > .layout--close"
    )),
      (this.focus_start = this.querySelector(".drawer--focus-start")),
      (this.focus_triggers = this.querySelectorAll(".drawer--focus-trigger")),
      (this.overlay = this.querySelector(".drawer--overlay")),
      (this.viewport = this.parentElement),
      (this.state = {}),
      this.load(),
      this.addListeners();
  }
  load() {
    this.loadTriggers(),
      this.touchListener(),
      Shopify.designMode && this.addEditorListener();
  }
  addListeners() {
    window.on("theme:drawer:close", () => this.close()),
      window.on(
        "theme:drawer:open",
        ({ detail: { side: t, view: e, trigger: i } }) => {
          this.open(t, e, i);
        }
      ),
      window.on("theme:drawer:loadTriggers", () => this.loadTriggers());
  }
  loadTriggers() {
    (this.close_triggers = document.querySelectorAll("[data-drawer-close]")),
      (this.open_triggers = document.querySelectorAll("[data-drawer-open]")),
      this.closeListeners(),
      this.toggleListeners();
  }
  closeListeners() {
    this.focus_triggers.off("focus"),
      this.focus_triggers.on("focus", () => this.close()),
      window.off("keydown.Drawer"),
      window.on("keydown.Drawer", (t) => {
        "Escape" === t.key && "closed" !== Drawer.status && this.close();
      }),
      [...this.close_triggers, this.overlay].off("click.Drawer keydown.Drawer"),
      [...this.close_triggers, this.overlay].on(
        "click.Drawer keydown.Drawer",
        ({ key: t, type: e }) => {
          ("keydown" === e && "Enter" !== t) || this.close();
        }
      );
  }
  toggleListeners() {
    this.open_triggers.off("click.Drawer keydown.Drawer"),
      this.open_triggers.on("click.Drawer keydown.Drawer", (t) => {
        var e, i;
        ("keydown" === t.type && "Enter" !== t.key) ||
          ((e = t.target.getAttribute("data-drawer-open")),
          (i = t.target.getAttribute("data-drawer-view")),
          this.open(e, i, t.target),
          t.preventDefault(),
          t.stopPropagation());
      });
  }
  toggle(t) {
    (Drawer.status = t),
      this.viewport.setAttribute("data-drawer-status", t),
      "opening" === t
        ? this.opening()
        : "closing" === t
        ? this.closing()
        : "opened" === t
        ? this.opened()
        : "closed" === t && this.closed(),
      window.trigger(`theme:drawer:${this.state.side}:${t}`);
  }
  open(t, e, i) {
    Drawer.status.includes("open") && t != this.state.side
      ? ((this.pending_open = [t, e, i]), this.close())
      : ((this.pending_open = null),
        (this.state = {
          active: this.querySelector(`.drawer--side[data-side=${t}]`),
          side: t,
          trigger: i,
          view: e,
        }),
        this.viewport.setAttribute("data-drawer-view", e),
        this.viewport.setAttribute("data-drawer-side", t),
        "opened" != Drawer.status && this.toggle("opening"));
  }
  opening() {
    requestAnimationFrame(() => {
      this.state.active.setAttribute("aria-expanded", !0),
        this.overlay.setAttribute("aria-hidden", !1),
        this.scrollToTop(),
        "top" !== this.state.side && this.toggleCloseButton(!0),
        this.state.active.on("transitionend", () => this.toggle("opened"), {
          once: !0,
        });
    });
  }
  opened() {
    var t = document.getElementById(
      this.state.active.getAttribute("data-focus-id")
    );
    (t || this.focus_start).focus();
  }
  close() {
    Drawer.status.includes("clos") || this.toggle("closing");
  }
  closing() {
    this.overlay.setAttribute("aria-hidden", !0),
      "top" != this.state.side && this.toggleCloseButton(!1),
      this.state.active.setAttribute("aria-expanded", !1),
      this.state.active.on("transitionend", () => this.toggle("closed"), {
        once: !0,
      }),
      this.state.trigger && this.state.trigger.focus(),
      window.trigger(`theme:transition:reset:${this.state.view}`);
  }
  closed() {
    this.viewport.removeAttribute("data-drawer-view"),
      this.viewport.removeAttribute("data-drawer-side"),
      this.pending_open && this.open(...this.pending_open);
  }
  scrollToTop() {
    var t = this.state.active.querySelector("[data-drawer-scroll-container]");
    (t || this.state.active).scrollTo(0, 0);
  }
  toggleCloseButton(t) {
    this.close_button.setAttribute("aria-hidden", !t),
      t
        ? this.close_button.on(
            "click.Drawer keydown.Drawer",
            ({ key: t, type: e }) => {
              ("keydown" === e && "Enter" !== t) || this.close();
            }
          )
        : this.close_button.off("click.Drawer keydown.Drawer");
  }
  touchListener() {
    window.matchMedia("(pointer: coarse)").matches &&
      (window.on("theme:swipe:left", () => {
        Drawer.disable_swipe_listener ||
          "left" !== this.state.side ||
          "opened" != Drawer.status ||
          this.close();
      }),
      window.on("theme:swipe:right", () => {
        Drawer.disable_swipe_listener ||
          "right" !== this.state.side ||
          "opened" != Drawer.status ||
          this.close();
      }));
  }
  addEditorListener() {
    window.on("shopify:section:load", () => this.loadTriggers());
  }
  static open(t, e, i) {
    window.trigger("theme:drawer:open", { side: t, view: e, trigger: i });
  }
  static close() {
    window.trigger("theme:drawer:close");
  }
}
customElements.define("drawer-element", Drawer);
class Cart extends HTMLElement {
  static basket = {};
  static sections =
    window.location.pathname === Shopify.routes.cart
      ? ["cart-drawer", "cart-desktop", "cart-mobile"]
      : ["cart-drawer"];
  constructor() {
    super();
  }
  connectedCallback() {
    (this.abort_controllers = {}),
      (this.checkout_button = this.querySelector(".cart--checkout-button")),
      (this.note = this.querySelector(".cart--notes--textarea")),
      (this.view = this.dataset.view),
      this.toggleLoadingOnSubmit(),
      this.addUpdateHtmlListener(),
      this.note && this.addNoteListeners(),
      "drawer" === this.view &&
        ((this.summary = this.querySelector(".cart--summary")),
        new ResizeObserver(() => {
          requestAnimationFrame(() => this.updateSummaryHeight());
        }).observe(this));
  }
  toggleLoadingOnSubmit() {
    this.checkout_button.on("click", () =>
      this.checkout_button.setAttribute("aria-busy", !0)
    ),
      window.on("pagehide", (t) => {
        t.persisted && this.checkout_button.setAttribute("aria-busy", !1);
      });
  }
  addUpdateHtmlListener() {
    window.on(
      `theme:cart:${this.view}:updateHtml`,
      ({ detail: { section: t, load_transitions: e } }) => {
        t &&
          (this.swapInNewContent(t.parse(".cart--form")),
          "drawer" === this.view && this.updateSummaryHeight(),
          this.toggleLoadingDisplay(!0),
          e && window.trigger(`theme:transition:reload:cart-${this.view}`),
          window.trigger("theme:cart:updated", this));
      }
    );
  }
  addNoteListeners() {
    this.note.on("input", () => {
      this.updateNote(this.note.value),
        window.trigger("theme:cart:noteUpdate", {
          source: this.view,
          note: this.note.value,
        });
    }),
      window.on(
        "theme:cart:noteUpdate",
        ({ detail: { source: t, note: e } }) => {
          t !== this.view && (this.note.value = e);
        }
      );
  }
  async updateNote(t) {
    this.abort_controllers.note && this.abort_controllers.note.abort(),
      (this.abort_controllers.note = new AbortController());
    try {
      await fetch(`${Shopify.routes.cart_update}.js`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: t }),
        signal: this.abort_controllers.note.signal,
      });
    } catch {}
  }
  toggleLoadingDisplay(t, e) {
    var i;
    !t &&
      e &&
      (i = this.querySelector(`.cart--item[data-line-num='${e}'] input`)) &&
      i.setAttribute("aria-busy", !0),
      t
        ? this.checkout_button.removeAttribute("disabled")
        : this.checkout_button.setAttribute("disabled", "disabled");
  }
  async tryToUpdateQuantity(t, e) {
    this.toggleLoadingDisplay(!1, t);
    try {
      (await this.updateQuantity(t, e)) || 0 === e || this.showQuantityError(t);
    } catch {}
  }
  showQuantityError(t) {
    var e = this.querySelector(`.cart--item[data-line-num='${t}']`);
    e && e.querySelector(".cart--error").setAttribute("aria-hidden", !1);
  }
  async updateQuantity(t, e) {
    this.abort_controllers.line_num && this.abort_controllers.line_num.abort(),
      (this.abort_controllers.line_num = new AbortController());
    var i = this.querySelector(`.cart--item[data-line-num='${t}']`),
      { management: s, policy: r, quantity: a } = i.dataset,
      o = parseInt(a),
      n = i.getAttribute("data-variant-id"),
      h = this.getOtherVariantQuantities(i, n),
      l = o < e + h && "shopify" === s && "continue" !== r;
    l && (e = o - h);
    try {
      var d,
        c,
        u,
        p = await fetch(`${Shopify.routes.cart_change}.js`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            line: t,
            quantity: e,
            sections: Cart.sections,
          }),
          signal: this.abort_controllers.line_num.signal,
        });
      if (p.ok)
        return (
          ({ items: d, item_count: c, sections: u } = await p.json()),
          Cart.fillBasket(d),
          Cart.updateTotals(c),
          Cart.updateAllHtml(u),
          !l
        );
      throw new Error(p.statusText);
    } catch {
      throw new Error("aborted");
    }
  }
  getOtherVariantQuantities(t, e) {
    var i = this.querySelectorAll(`.cart--item[data-variant-id='${e}']`);
    let s = 0;
    return (
      i.not(t).forEach((t) => {
        var e = t.querySelector(".quantity-selector--input");
        s += parseInt(e.value);
      }),
      s
    );
  }
  updateSummaryHeight() {
    this.style.setProperty(
      "--summary-height",
      `${this.summary.offsetHeight}px`
    );
  }
  swapInNewContent(t) {
    var e = this.querySelector(".cart--body"),
      i = t.querySelector(".cart--body"),
      s = this.querySelector(".cart--shipping"),
      r = t.querySelector(".cart--shipping"),
      a =
        (s && r && this.updateShipping(s, r),
        (i = this.swapInImages(e, i)),
        e && i && e.replaceWith(i),
        this.querySelector(".cart--totals")),
      o = t.querySelector(".cart--totals");
    a && o && a.replaceWith(o);
  }
  updateShipping(t, e) {
    var i = e
        .querySelector(".cart--shipping-bar")
        .style.getPropertyValue("--progress-percent"),
      s =
        (t
          .querySelector(".cart--shipping-bar")
          .style.setProperty("--progress-percent", i),
        e.querySelector(".cart--shipping-message"));
    t.querySelector(".cart--shipping-message").textContent = s.textContent;
  }
  swapInImages(r, t) {
    var e = t.querySelectorAll(".cart--item");
    return (
      0 !== e.length &&
      (e.forEach((t) => {
        var e = t.getAttribute("data-variant-id"),
          i = t.querySelector(".cart--item--image"),
          s = r.querySelector(`[data-variant-id='${e}'] .cart--item--image`);
        s && i && i.replaceWith(s);
      }),
      t)
    );
  }
  static updateAllHtml(t, i) {
    Object.entries(t).forEach(([t, e]) => {
      window.trigger(`theme:cart:${t.replace(/^cart-/, "")}:updateHtml`, {
        section: e,
        load_transitions: i,
      });
    });
  }
  static async addItems(t = {}, e = !1) {
    var i = await fetch(`${Shopify.routes.cart_add}.js`, t);
    if (!i.ok) throw new Error(i.statusText);
    var { id: s, items: r, quantity: a, sections: o } = await i.json();
    r
      ? r.forEach(({ id: t, quantity: e }) => Cart.updateBasket(t, e))
      : s && a && Cart.updateBasket(s, a),
      e && Cart.openDrawer(e),
      Cart.updateTotals(Object.values(Cart.basket).reduce((t, e) => t + e, 0)),
      Cart.updateAllHtml(o, !0);
  }
  static openDrawer(t) {
    window.on(
      "theme:cart:updated",
      () => {
        requestAnimationFrame(() => {
          window.trigger("theme:transition:reset:cart-drawer"),
            Drawer.open("right", "cart-drawer", t);
        });
      },
      { once: !0 }
    );
  }
  static async fetchBasket() {
    var t = await fetch(`${Shopify.routes.cart}.js`);
    if (!t.ok) throw new Error(t.statusText);
    var e = (await t.json()).items;
    Cart.fillBasket(e);
  }
  static updateBasket(t, e) {
    (Cart.basket[t] = e), window.trigger("theme:cart:productAdded", t);
  }
  static fillBasket(t) {
    (Cart.basket = {}),
      t.forEach(({ id: t, quantity: e }) => (Cart.basket[t] = e));
  }
  static updateTotals(t) {
    document
      .querySelector("[data-cart-count]")
      ?.setAttribute("data-cart-count", t),
      document
        .querySelector(".layout--viewport")
        ?.setAttribute("data-cart-empty", 0 === t);
  }
}
customElements.define("cart-element", Cart);
class Modal extends HTMLElement {
  static status = "closed";
  static viewport = document.querySelector(".layout--viewport");
  static close_button = document.querySelector(
    ".layout--navigation > .layout--close"
  );
  static next_button = document.querySelector(".layout--next");
  static previous_button = document.querySelector(".layout--previous");
  constructor() {
    super(),
      (this.blocking = null !== this.dataset.blocking && this.dataset.blocking),
      this.blocking
        ? (this.local_storage_name = `${Shopify.theme.name}:${this.blocking}`)
        : Modal.viewport.appendChild(this),
      (this.close_buttons = this.querySelectorAll("[data-modal-close]")),
      (this.focus_triggers = this.querySelectorAll(".modal--focus-trigger")),
      (this.next_buttons = this.querySelectorAll('[data-modal-button="next"]')),
      (this.previous_buttons = this.querySelectorAll(
        '[data-modal-button="previous"]'
      )),
      (this.views = this.querySelectorAll(".modal--view")),
      (this.trigger = document.querySelector("#a11y_skip")),
      (this.state = {
        active_index: 0,
        previous_index: this.views.length - 1,
        active_view: this.views[0],
        previous_view: this.views[this.views.length - 1],
        disabled_click: !1,
      });
  }
  connectedCallback() {
    !this.blocking ||
      Shopify.designMode ||
      (window.localStorage &&
        void 0 !== localStorage[this.local_storage_name]) ||
      this.open(),
      this.triggerListeners();
  }
  disconnectedCallback() {
    this.close();
  }
  triggerListeners() {
    window.on(`theme:modal:open:${this.dataset.id}`, ({ detail: t }) => {
      var { delay: e, index: i } = t;
      isNaN(i) || this.toggleView(i, !1),
        "closed" !== Drawer.status && Drawer.close(),
        isNaN(e) ? this.open(this) : setTimeout(() => this.open(this), e);
    });
  }
  updateStatus(t) {
    (Modal.status = t), Modal.viewport.setAttribute("data-modal-status", t);
  }
  open(t) {
    "opened" !== Modal.status &&
      (t && (this.trigger = t),
      Modal.viewport.setAttribute("data-modal-view", this.dataset.id),
      this.setAttribute("aria-hidden", !1),
      this.updateStatus("opened"),
      requestAnimationFrame(() => {
        this.on("transitionend", () => this.opened(), { once: !0 }),
          this.setAttribute("data-transition-active", !0),
          this.blocking || Modal.toggleButtons(!0, 1 < this.views.length);
      }),
      this.addListeners());
  }
  opened() {
    var t = document.getElementById(this.getAttribute("data-focus-id"));
    (t || Modal.close_button).focus();
  }
  addListeners() {
    (this.next_buttons.length ? this.next_buttons : Modal.next_button).on(
      `click.${this.dataset.id}-modal`,
      () => {
        this.state.disabled_click || this.toggleView("next");
      }
    ),
      (this.close_buttons.length ? this.close_buttons : Modal.close_button).on(
        `click.${this.dataset.id}-modal`,
        () => {
          this.state.disabled_click || this.close();
        }
      ),
      (this.previous_buttons.length
        ? this.previous_buttons
        : Modal.previous_button
      ).on(`click.${this.dataset.id}-modal`, () => {
        this.state.disabled_click || this.toggleView("previous");
      }),
      this.blocking ||
        (window.on(`keydown.${this.dataset.id}-modal`, ({ key: t }) => {
          var e;
          this.state.disabled_click ||
            ((e = 1 < this.views.length && !this.blocking),
            "Escape" === t
              ? this.close()
              : "ArrowLeft" === t
              ? e && this.toggleView("previous")
              : "ArrowRight" === t && e && this.toggleView("next"));
        }),
        this.on(`click.${this.dataset.id}-modal`, ({ target: t }) => {
          this.state.disabled_click || (t === this && this.close());
        }),
        this.focus_triggers.length &&
          this.focus_triggers.on(`focus.${this.dataset.id}-modal`, () => {
            this.state.disabled_click || this.close();
          }));
  }
  close() {
    "closed" === Modal.status ||
      this.state.disabled_click ||
      (this.on("transitionend", () => this.closed(), { once: !0 }),
      !Shopify.designMode && this.trigger && this.trigger.focus(),
      this.setAttribute("data-transition-type", "fade-out"),
      this.updateStatus("closed"),
      this.blocking
        ? (localStorage[this.local_storage_name] = "true")
        : Modal.toggleButtons(!1),
      this.removeListeners());
  }
  closed() {
    this.setAttribute("data-transition-type", "fade-in"),
      this.setAttribute("data-transition-active", !1),
      this.setAttribute("aria-hidden", !0);
  }
  removeListeners() {
    var t = this.next_buttons.length ? this.next_buttons : Modal.next_button,
      e = this.close_buttons.length ? this.close_buttons : Modal.close_button;
    [
      t,
      this.previous_buttons.length
        ? this.previous_buttons
        : Modal.previous_button,
      e,
    ].off(`click.${this.dataset.id}-modal`),
      this.blocking ||
        (window.off(`keydown.${this.dataset.id}-modal`),
        this.off(`click.${this.dataset.id}-modal`),
        this.focus_triggers.length &&
          this.focus_triggers.off(`focus.${this.dataset.id}-modal`));
  }
  toggleView(e) {
    if (!this.state.disabled_click) {
      let t = !0;
      "next" === e
        ? this.updateView(this.state.active_index + 1, !0)
        : "previous" === e
        ? this.updateView(this.state.active_index - 1)
        : isNaN(e) || (this.updateView(e, !0), (t = !1)),
        t
          ? (this.state.previous_view.on(
              "transitionend",
              () => {
                this.state.active_view.setAttribute(
                  "data-transition-active",
                  !0
                ),
                  this.state.previous_view.setAttribute(
                    "data-transition-type",
                    "scale-in"
                  ),
                  this.state.previous_view.setAttribute(
                    "data-transition-active",
                    !1
                  );
              },
              { once: !0 }
            ),
            this.state.active_view.on(
              "transitionend",
              () => {
                this.state.active_view.setAttribute(
                  "data-transition-active",
                  !1
                ),
                  this.state.active_view.setAttribute(
                    "data-transition-type",
                    "scale-out"
                  ),
                  (this.state.disabled_click = !1);
              },
              { once: !0 }
            ),
            (this.state.disabled_click = !0),
            this.state.previous_view.setAttribute("data-transition-active", !0))
          : this.views.forEach((t) => {
              var e = t === this.state.active_view;
              t.setAttribute(
                "data-transition-type",
                e ? "scale-out" : "scale-in"
              ),
                t.setAttribute("data-transition-active", !1);
            });
    }
  }
  updateView(t, e) {
    t > this.views.length - 1
      ? ((this.state.active_index = 0),
        (this.state.previous_index = this.views.length - 1))
      : t < 0
      ? ((this.state.previous_index = 0),
        (this.state.active_index = this.views.length - 1))
      : ((this.state.previous_index =
          0 === t ? (e ? this.views.length - 1 : 1) : this.state.active_index),
        (this.state.active_index = t)),
      (this.state.active_view = this.views[this.state.active_index]),
      (this.state.previous_view = this.views[this.state.previous_index]);
  }
  static toggleButtons(t, e = !1) {
    Modal.close_button.setAttribute("aria-hidden", !t),
      [Modal.previous_button, Modal.next_button].forEach((t) =>
        t.setAttribute("aria-hidden", !e)
      );
  }
}
customElements.define("modal-element", Modal);
class ModalTrigger extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let i = parseInt(this.getAttribute("data-delay")),
      s = parseInt(this.getAttribute("data-index")),
      r = this.dataset.id;
    this.on(
      `click.${r}-modal-trigger keydown.${r}-modal-trigger`,
      ({ type: t, key: e }) => {
        ("keydown" === t && "Enter" !== e) ||
          window.trigger(`theme:modal:open:${r}`, { delay: i, index: s });
      }
    );
  }
}
customElements.define("modal-trigger", ModalTrigger);
class FeedbackBar extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.message_container = this.querySelector(".feedback-bar--message")),
      (this.message_json = JSON.parse(
        this.querySelector("script").textContent
      )),
      this.load(),
      this.addEventListeners();
  }
  load(t = !1) {
    var e = window.location.hash.substring(1),
      i = t || e.replace("feedback-bar--", "");
    this.message_json[i] &&
      ((this.message_container.textContent = this.message_json[i]),
      this.open());
  }
  addEventListeners() {
    window.on("theme:feedback:trigger", ({ detail: { type: t, value: e } }) => {
      this.trigger(t, e);
    }),
      window.on("theme:feedback:load", ({ detail: { async: t } }) => {
        this.load(t || !1);
      });
  }
  open() {
    window.trigger("theme:feedback:opened"),
      this.setAttribute("aria-hidden", !1),
      requestAnimationFrame(() =>
        this.setAttribute("data-transition-active", !0)
      ),
      this.timeout && clearTimeout(this.timeout),
      (this.timeout = setTimeout(() => this.close(), 5e3));
  }
  close() {
    this.setAttribute("data-transition-active", !1),
      this.on(
        "transitionend",
        () => {
          window.trigger("theme:feedback:closed"),
            this.setAttribute("aria-hidden", !0);
        },
        { once: !0 }
      );
  }
  trigger(t, e) {
    "copy" === t
      ? (navigator.clipboard.writeText(window.location.href),
        this.load("copied"))
      : "quantity" === t && this.loadProductQuantity(e);
  }
  loadProductQuantity(t) {
    var e;
    0 === t
      ? this.load("product--no-items")
      : 1 === t
      ? this.load("product--one-item")
      : 1 < t &&
        ((e = this.message_json["product--n-items"].replace("[num_items]", t)),
        (this.message_json[`product--${t}-items`] = e),
        this.load(`product--${t}-items`));
  }
  static trigger(t, e) {
    window.trigger("theme:feedback:trigger", { type: t, value: e });
  }
  static load(t = !1) {
    window.trigger("theme:feedback:load", { async: t });
  }
}
customElements.define("feedback-bar-element", FeedbackBar);
class QuickAdd extends HTMLElement {
  static index = 0;
  constructor() {
    super(), (this.id = QuickAdd.index++);
  }
  connectedCallback() {
    (this.button = this.querySelector(".product-quick-add--button")),
      (this.button_text = this.querySelector(".product-quick-add--text")),
      (this.handle = this.dataset.handle),
      (this.form_selector = `.product-quick-add--form[data-handle="${this.handle}"]`),
      (this.has_form = "true" === this.dataset.form),
      (this.inside_drawer = !!this.closest(".drawer--side")),
      (this.product_drawer = document.querySelector(
        '.drawer--container[data-view="product-form"]'
      )),
      (this.variant_id = this.dataset.id),
      (this.query = `?section_id=product-quick-add--form&variant=${this.variant_id}`),
      this.addResizeObserver(),
      this.addClickListener(),
      this.inside_drawer && this.addDrawerListeners(),
      this.has_form &&
        (this.addToggleListener(),
        "complete" === document.readyState
          ? this.addPreloadObserver()
          : window.on("load", () => this.addPreloadObserver()));
  }
  disconnectedCallback() {
    window.off(`theme:drawer:left:opened.QuickAdd${this.id}`);
  }
  addResizeObserver() {
    new ResizeObserver(() => {
      "small" !== window.sizeQuery &&
        requestAnimationFrame(() => this.calculateFullWidth());
    }).observe(this.parentNode);
  }
  calculateFullWidth() {
    (this.button.style.width = "auto"),
      (this.button_text.style.display = "block"),
      requestAnimationFrame(() => {
        this.style.setProperty(
          "--expanded-width",
          `${this.button.offsetWidth + 1}px`
        ),
          this.button.removeAttribute("style"),
          this.button_text.removeAttribute("style");
      });
  }
  addClickListener() {
    this.button.off("click"),
      this.button.on("click", async (t) => {
        t.preventDefault(),
          this.setAttribute("aria-busy", !0),
          this.has_form ? await this.showForm() : await this.addToCart(),
          this.setAttribute("aria-busy", !1);
      });
  }
  addPreloadObserver() {
    (this.preload_observer = new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        t && (this.fetchForm(), this.preload_observer.disconnect());
      }
    )),
      this.preload_observer.observe(this);
  }
  async fetchForm() {
    var t = this.product_drawer.querySelector(this.form_selector);
    if (t) this.form = t;
    else
      try {
        var e,
          i = await fetch(
            `${Shopify.routes.root}products/${this.handle}/${this.query}`
          );
        i.ok &&
          !this.form &&
          ((e = (await i.text()).parse(".product-quick-add--form")),
          (this.form = e),
          requestAnimationFrame(() =>
            this.product_drawer.appendChild(this.form)
          ));
      } catch (t) {
        console.error("Error fetching quick add form:", t);
      }
  }
  async showForm() {
    await this.fetchForm(),
      window.trigger("theme:quickAdd:toggle", this.handle),
      Drawer.open("right", "product-form", this),
      Shopify.PaymentButton?.init(),
      Utils.updateRecentProducts(this.handle),
      this.addResetListener();
  }
  addResetListener() {
    window.on(
      "theme:drawer:right:closing",
      () => {
        this.form.remove(), (this.form = null), this.fetchForm();
      },
      { once: !0 }
    );
  }
  async addToCart() {
    if (Utils.getQuantity(this.variant_id, this.dataset, 1)) {
      var t = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: this.variant_id, quantity: 1 }],
          sections: Cart.sections,
        }),
      };
      try {
        await Cart.addItems(t, this.button);
      } catch (t) {
        throw new Error(t);
      }
    }
  }
  addDrawerListeners() {
    window.on(`theme:drawer:left:opened.QuickAdd${this.id}`, () => {
      this.calculateFullWidth();
    });
  }
  addToggleListener() {
    window.on("theme:quickAdd:toggle", ({ detail: t }) => {
      this.form?.setAttribute("aria-hidden", t !== this.handle);
    });
  }
}
customElements.define("product-quick-add", QuickAdd);
class General {
  constructor() {
    console.info(
      `%cBlockshop theme v12.2.1 by Troop Themes - Learn about our JS API here:\nhttps://support.troopthemes.com/guide/api-for-custom-code?utm_source=console&utm_medium=console`,
      [
        "background: green",
        "color: white",
        "font-weight: bold",
        "padding: 2px",
      ].join(";")
    ),
      Utils.loadAllTransitions(),
      this.setSwipeConfig(),
      window.on("load", () => {
        this.configureLinks(),
          this.addPrefetchListeners(),
          Cart.fetchBasket(),
          document.body.setAttribute("data-theme-loaded", !0);
      });
  }
  setSwipeConfig() {
    Utils.scriptLoader(
      "swipe_listener",
      Shopify.routes.libraries.swipe_listener,
      () => {
        var t;
        window.SwipeListener &&
          ((Utils.disable_prevent_scroll = !1),
          (Utils.disable_swipe_listener = !1),
          (t = document.querySelectorAll("input, textarea")).on(
            "focus",
            () => (Utils.disable_prevent_scroll = !0)
          ),
          t.on("blur", () => (Utils.disable_prevent_scroll = !1)),
          SwipeListener(document, {
            preventScroll: ({ detail: t }) => {
              var e;
              if (!Utils.disable_prevent_scroll)
                return (
                  (e = Math.abs(t.x[0] - t.x[1])),
                  2 * Math.abs(t.y[0] - t.y[1]) < e
                );
            },
          }),
          document.on("swipe", (t) => {
            var e, i, s, r;
            Utils.disable_swipe_listener ||
              (({ left: e, right: i, top: s, bottom: r } = t.detail.directions),
              e && window.trigger("theme:swipe:left"),
              i && window.trigger("theme:swipe:right"),
              s && window.trigger("theme:swipe:top"),
              r && window.trigger("theme:swipe:bottom"));
          }));
      }
    );
  }
  configureLinks() {
    document
      .querySelectorAll('[data-item="hidden-text"] a')
      .forEach((t) => t.setAttribute("tabindex", "-1")),
      document
        .querySelectorAll(
          `a[href^="http"]:not([href*="${window.location.hostname}"])`
        )
        .forEach((t) => t.setAttribute("target", "_blank"));
  }
  addPrefetchListeners() {
    document
      .querySelectorAll(
        `a:is([href*="${window.location.hostname}"], [href^="/"])`
      )
      ?.forEach((i) => {
        new IntersectionObserver(
          ([{ isIntersecting: t }], e) => {
            t &&
              (Utils.linkLoader(i.href, "prefetch", "high", "document"),
              e.disconnect());
          },
          { rootMargin: "25% 0px", threshold: 0.01 }
        ).observe(i);
      });
  }
}
new General();
class Popup extends HTMLElement {
  static instances = [];
  static parent = document.querySelector(".popup--root");
  static options = {
    size: parseInt(Popup.parent && Popup.parent.getAttribute("data-size")),
    limit: Popup.parent && "true" === Popup.parent.getAttribute("data-limit"),
    consent_tracking:
      Popup.parent &&
      "true" === Popup.parent.getAttribute("data-consent-tracking"),
  };
  constructor() {
    super();
  }
  connectedCallback() {
    Popup.instances.unshift(this),
      (this.bottom_observer = document.querySelector(".layout--bottom")),
      (this.container = this.querySelector(".popup--block--container")),
      (this.close_link = this.querySelector(".layout--close")),
      (this.delay = parseInt(1e3 * this.getAttribute("data-delay"))),
      (this.referrer_enabled =
        "true" === this.getAttribute("data-referrer-enabled")),
      (this.referrer_url = this.getAttribute("data-referrer-url")),
      (this.show_again_after = parseInt(
        this.getAttribute("data-show-again-after")
      )),
      (this.show_at_bottom =
        "true" === this.getAttribute("data-show-at-bottom"));
    var t = this.getAttribute("data-block-id");
    (this.id = `${Shopify.theme.name}:popup:${t}`),
      this.eventListeners(),
      Popup.options.consent_tracking ||
        Popup.options.size !== Popup.instances.length ||
        Popup.loadNext();
  }
  load() {
    (!this.referrer_enabled || document.referrer.includes(this.referrer_url)) &&
    (void 0 === localStorage[this.id] || this.readyToReset())
      ? (this.setResetTime(), this.startTimer())
      : (Popup.loadNext(), Shopify.designMode || this.remove());
  }
  startTimer() {
    Popup.options.limit && Popup.removeAll(),
      (this.timer = setTimeout(
        () => !Shopify.designMode && this.open(),
        this.delay
      )),
      this.show_at_bottom && this.addObserver();
  }
  addObserver() {
    this.bottom_observer &&
      ((this.observer = new IntersectionObserver(
        ([{ isIntersecting: t }], e) => {
          t &&
            (Shopify.designMode || this.open(),
            clearTimeout(this.timer),
            e.disconnect());
        },
        { threshold: 0.1 }
      )),
      this.observer.observe(this.bottom_observer));
  }
  eventListeners() {
    this.close_link.on("click", () => {
      this.close(),
        this.observer && this.observer.disconnect(),
        Popup.loadNext();
    });
  }
  open() {
    window.trigger("theme:popup:opened"),
      this.setAttribute("aria-hidden", !1),
      requestAnimationFrame(() =>
        this.setAttribute("data-transition-active", !0)
      );
  }
  close() {
    window.trigger("theme:popup:closed"),
      this.setAttribute("data-transition-active", !1),
      this.on("transitionend", () => !Shopify.designMode && this.remove(), {
        once: !0,
      });
  }
  readyToReset() {
    var t = JSON.parse(localStorage[this.id]).expires,
      e = new Date().getTime();
    return parseFloat(t - e) <= 0 && (this.setResetTime(), !0);
  }
  setResetTime() {
    var t = new Date(),
      e = 864e5 * this.show_again_after,
      i = t.setTime(t.getTime() + e);
    localStorage[this.id] = JSON.stringify({ expires: i });
  }
  static loadNext() {
    0 < Popup.instances.length && Popup.instances.pop().load();
  }
  static removeAll() {
    Popup.instances.forEach((t) => !Shopify.designMode && t.remove()),
      (Popup.instances = []);
  }
}
customElements.define("popup-block", Popup);
class Carousel extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.blocks = this.querySelectorAll(".carousel--block")),
      (this.container = this.querySelector(".carousel--container")),
      (this.focusable_el = Utils.getFocusableEl(this)),
      (this.links = this.container?.querySelectorAll("a")),
      (this.next_desktop = this.querySelector(".carousel--next")),
      (this.prev_desktop = this.querySelector(".carousel--prev")),
      (this.nav = document.querySelector(
        `.carousel-nav-arrow[data-id=${this.dataset.id}]`
      )),
      this.nav &&
        ((this.nav_current = this.nav.querySelector(
          ".carousel-nav-arrow--current"
        )),
        (this.next_mobile = this.nav.querySelector(
          ".carousel-nav-arrow--next"
        )),
        (this.prev_mobile = this.nav.querySelector(
          ".carousel-nav-arrow--prev"
        ))),
      (this.blocks_per_slide_desktop = parseInt(
        this.getAttribute("data-columns")
      )),
      (this.blocks_per_slide_mobile = parseInt(
        this.getAttribute("data-mobile-columns")
      )),
      (this.mobile_only = "true" === this.getAttribute("data-mobile-only")),
      (this.section_id =
        this.closest("[data-section-id]").getAttribute("data-section-id")),
      (this.transition_type = this.getAttribute("data-transition-type")),
      (this.slide_count = parseInt(
        this.style.getPropertyValue("--total-slides")
      )),
      (this.mobile_slide_count = parseInt(
        this.style.getPropertyValue("--total-slides-mobile")
      )),
      (this.active_slide = 1),
      (this.slide_pause = !1),
      (this.container_destination = "0px"),
      (this.active_blocks = null),
      (this.blocks_per_slide = null),
      (this.old_active_blocks = null),
      (this.loaded_size = null),
      (this.active_slide_count = null),
      (this.sizeQuery = this.dataset.id),
      (this.swipe_state = null),
      (this.width = null),
      Shopify.designMode && this.blockListeners(),
      new IntersectionObserver(([{ isIntersecting: t }], e) => {
        t && (this.addResizeObserver(), e.disconnect());
      }).observe(this);
  }
  addResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => {
        0 === this.offsetWidth
          ? (this.width = this.offsetWidth)
          : this.width !== this.offsetWidth &&
            ((this.width = this.offsetWidth), this.load());
      });
    }).observe(this);
  }
  load() {
    this.initNewScreenSize(),
      requestAnimationFrame(() => {
        this.getHeights(),
          this.updateActive(),
          this.goToActiveSlide(),
          this.setSliderHeight(),
          ("small" !== window.sizeQuery && this.mobile_only) ||
          1 === this.active_slide_count
            ? this.removeListeners()
            : (this.arrowNavListeners(),
              this.mouseDownListener(),
              this.swipeListener());
      });
  }
  blockListeners() {
    this.blocks.off(`shopify:block:select.${this.section_id}`),
      this.blocks.on(
        `shopify:block:select.${this.section_id}`,
        ({ target: t }) => {
          this.blockSelectedCallback(t);
        }
      ),
      this.blocks.off(`shopify:block:deselect.${this.section_id}`),
      this.blocks.on(`shopify:block:deselect.${this.section_id}`, () => {
        this.blockDeselectedCallback();
      });
  }
  blockSelectedCallback(t) {
    (SlideshowCarousel.block_selected = t), this.initNewScreenSize();
    var e = t.classList.contains("carousel--block")
        ? t
        : t.closest(".carousel--block"),
      i = Math.ceil((e.index() + 1) / this.blocks_per_slide);
    this.updateThenGoToActiveSlide(i);
  }
  blockDeselectedCallback() {
    SlideshowCarousel.block_selected = !1;
  }
  initNewScreenSize() {
    "small" === this.sizeQuery
      ? "small" !== this.loaded_size &&
        ((this.active_slide_count = this.mobile_slide_count),
        (this.loaded_size = "small"),
        (this.blocks_per_slide = this.blocks_per_slide_mobile),
        (this.active_slide = Math.ceil(
          (this.blocks_per_slide_desktop * (this.active_slide - 1) + 1) /
            this.blocks_per_slide_mobile
        )))
      : "medium-large" !== this.loaded_size &&
        ((this.active_slide_count = this.slide_count),
        (this.loaded_size = "medium-large"),
        (this.blocks_per_slide = this.blocks_per_slide_desktop),
        (this.active_slide = Math.ceil(
          (this.blocks_per_slide_mobile * (this.active_slide - 1) + 1) /
            this.blocks_per_slide_desktop
        )));
  }
  mouseDownListener() {
    this.container.off(
      `mousedown.${this.section_id} touchstart.${this.section_id}`
    ),
      this.container.on(
        `mousedown.${this.section_id} touchstart.${this.section_id}`,
        (t) => {
          if (!(1 < t.touches?.length)) {
            var e,
              i = t.target.closest(".carousel--block");
            if (i && this.checkForActiveModel && this.checkForActiveModel(i))
              return !1;
            (this.swipe_state = "swipe-started"),
              this.reenableClickAfterSwiping(),
              this.mouseUpListener(),
              (this.slide_pause = !0),
              "slide" === this.transition_type &&
                ((this.drag_start = (
                  "touchstart" === t.type ? t.targetTouches[0] : t
                ).pageX),
                (e =
                  this.style
                    .getPropertyValue("--slide-pos")
                    .replace(/[^0-9\-.,]/g, "") / 100),
                (this.current_transform_pixels =
                  this.container.offsetWidth * parseFloat(e)),
                this.container.setAttribute("data-transition-state", ""),
                this.style.setProperty(
                  "--slide-pos",
                  `${this.current_transform_pixels}px`
                ),
                this.dragBegin());
          }
        },
        { passive: !0 }
      );
  }
  mouseUpListener() {
    window.on(
      `mouseup.${this.section_id} touchend.${this.section_id}`,
      (t) => {
        1 < t.touches?.length ||
          ((this.swipe_state = "swipe-ended"),
          this.dragEnd(),
          !0 === this.slide_pause &&
            (this.container.setAttribute("data-transition-state", "forwards"),
            this.style.setProperty("--slide-pos", this.container_destination)));
      },
      { passive: !0, once: !0 }
    );
  }
  dragBegin() {
    this.setAttribute("data-dragging", !0),
      (Drawer.disable_swipe_listener = !0),
      window.on(
        `mousemove.${this.section_id} touchmove.${this.section_id}`,
        (e) => {
          if (!(1 < e.touches?.length)) {
            var i = ("touchmove" === e.type ? e.targetTouches[0] : e).pageX;
            let t = this.current_transform_pixels - this.drag_start + i;
            var s = this.carousel_width * (this.active_slide_count - 1);
            0 < t
              ? this.style.setProperty("--slide-pos", `${t / 4}px`)
              : t < -1 * s
              ? ((t = s + ((t *= -1) - s) / 4),
                this.style.setProperty("--slide-pos", `-${t}px`))
              : this.style.setProperty("--slide-pos", `${t}px`);
          }
        },
        { passive: !0 }
      );
  }
  dragEnd() {
    this.setAttribute("data-dragging", !1),
      (Drawer.disable_swipe_listener = !1),
      window.off(`mousemove.${this.section_id} touchmove.${this.section_id}`);
  }
  updateContainerDestination() {
    let t = ((this.active_slide - 1) / this.active_slide_count) * -100;
    var e;
    !this.is_first_slide &&
      this.is_last_slide &&
      0 < this.extra_blocks &&
      ((e =
        (this.blocks_per_slide - this.extra_blocks) / this.blocks_per_slide),
      (t += e * (100 / this.active_slide_count))),
      (this.container_destination = `${t}%`),
      this.style.setProperty("--slide-pos", this.container_destination);
  }
  slideToNext(t = !1, e = !1) {
    let i = "forwards";
    return (
      this.active_slide !== this.active_slide_count
        ? ((this.active_slide += 1),
          this.updateActive(),
          e &&
            (("small" === this.loaded_size && this.is_last_slide) ||
              ("small" != this.loaded_size && !this.prev_desktop?.focus())) &&
            this.prev_mobile?.focus())
        : t
        ? ((this.active_slide = 1), this.updateActive())
        : (i = "backwards"),
      this.updateSlideState(i),
      !0
    );
  }
  slideToPrev(t = !1) {
    var e = 1 !== this.active_slide ? "forwards" : "backwards";
    return (
      "forwards" == e &&
        (--this.active_slide, this.updateActive(t), t) &&
        (("small" === this.loaded_size && 1 === this.active_slide) ||
          ("small" != this.loaded_size && !this.next_desktop?.focus())) &&
        this.next_mobile?.focus(),
      this.updateSlideState(e),
      !0
    );
  }
  updateSlideState(t) {
    this.goToActiveSlide(!0, t), this.setSliderHeight(), this.updateArrowPos();
  }
  goToActiveSlide(t = !1, e = "forwards") {
    t && this.container.setAttribute("data-transition-state", e),
      this.updateContainerDestination();
  }
  resetPreviousTransitions() {
    (this.old_active_blocks &&
      Utils.arraysEqual(this.old_active_blocks, this.active_blocks)) ||
      (this.old_active_blocks || this.blocks.not(this.active_blocks)).forEach(
        (t) => {
          window.trigger(`theme:transition:reset:${t.dataset.id}`);
        }
      );
  }
  checkStartEnd() {
    this.setAttribute("data-first-slide", this.is_first_slide),
      this.setAttribute("data-last-slide", this.is_last_slide),
      [this.prev_desktop, this.prev_mobile].filter(Boolean).forEach((t) => {
        t.setAttribute("tabindex", this.is_first_slide ? "-1" : "0"),
          t.setAttribute("aria-disabled", this.is_first_slide);
      }),
      [this.next_desktop, this.next_mobile].filter(Boolean).forEach((t) => {
        t.setAttribute("tabindex", this.is_last_slide ? "-1" : "0"),
          t.setAttribute("aria-disabled", this.is_last_slide);
      });
  }
  updateActive() {
    this.active_blocks && (this.old_active_blocks = this.active_blocks);
    let t = (this.active_slide - 1) * this.blocks_per_slide,
      e = t + this.blocks_per_slide;
    (this.is_first_slide = 1 === this.active_slide),
      (this.is_last_slide = this.active_slide === this.active_slide_count),
      (this.extra_blocks = this.blocks.length % this.blocks_per_slide),
      this.is_last_slide &&
        0 < this.extra_blocks &&
        (e = this.blocks.length) - t < this.blocks_per_slide &&
        (t = this.blocks.length - this.blocks_per_slide),
      (this.active_blocks = [...this.blocks].slice(t, e)),
      this.nav &&
        this.nav_current?.setAttribute("data-value", this.active_slide),
      this.updateArrowPos(),
      this.toggleFocusableEl(),
      setTimeout(() => this.checkStartEnd(), 0);
  }
  toggleFocusableEl() {
    this.disabled_el?.forEach((t) => t.setAttribute("tabindex", "0")),
      (this.disabled_el = []),
      this.blocks.not(this.active_blocks).forEach((t) => {
        Utils.getFocusableEl(t).forEach((t) => this.disabled_el.push(t));
      }),
      this.disabled_el?.forEach((t) => t.setAttribute("tabindex", "-1"));
  }
  getHeights() {
    this.style.setProperty("--slide-height", "unset"),
      (this.heights = [...this.blocks].map((t) => {
        var e = t.querySelector(
          "img, .placeholder--root, svg, .product-video--root, .product-model--root, .video--root"
        );
        return (
          t.style.setProperty("--media-height", e?.offsetHeight || 0),
          t.style.setProperty("--block-height", t.offsetHeight),
          t.offsetHeight
        );
      }));
  }
  setSliderHeight() {
    let i = !0,
      s = [],
      r = "small" === this.loaded_size ? "mobile-display" : "display";
    this.active_blocks.forEach((t) => {
      var e = parseInt(getComputedStyle(t).getPropertyValue("--block-height"));
      s.push(e),
        "fill-available" ===
        t
          .querySelector(".image--root, .placeholder--root, .video--root")
          ?.getAttribute(`data-${r}-type`)
          ? t.style.setProperty("--media-height", Math.max(...this.heights))
          : (i = !1);
    });
    var t = i ? this.heights : s;
    this.style.setProperty("--slide-height", `${Math.max(...t)}px`);
  }
  updateArrowPos() {
    var t, e, i, s;
    this.prev_desktop &&
      this.next_desktop &&
      "small" !== this.loaded_size &&
      (1 != this.active_slide &&
        ((t = this.active_blocks[0]),
        (e = getComputedStyle(t).getPropertyValue("--media-height")),
        this.style.setProperty("--left-image-height", `${e}px`)),
      this.active_slide != this.active_slide_count) &&
      ((i = this.active_blocks[this.active_blocks.length - 1]),
      (s = getComputedStyle(i).getPropertyValue("--media-height")),
      this.style.setProperty("--right-image-height", `${s}px`));
  }
  swipeListener() {
    window.off(`theme:swipe:left.${this.section_id}`),
      window.on(`theme:swipe:left.${this.section_id}`, () => {
        "swipe-started" === this.swipe_state && this.swipeTo(!0);
      }),
      window.off(`theme:swipe:right.${this.section_id}`),
      window.on(`theme:swipe:right.${this.section_id}`, () => {
        "swipe-started" === this.swipe_state && this.swipeTo(!1);
      });
  }
  swipeTo(t) {
    (this.slide_pause = !1),
      t ? this.slideToNext() : this.slideToPrev(),
      this.preventClickWhenSwiping();
  }
  arrowNavListeners() {
    [this.prev_desktop, this.prev_mobile].filter(Boolean).forEach((t) => {
      t.off(`click.${this.section_id}`),
        t.on(`click.${this.section_id}`, () => this.slideToPrev(!0));
    }),
      [this.next_desktop, this.next_mobile].filter(Boolean).forEach((t) => {
        t.off(`click.${this.section_id}`),
          t.on(`click.${this.section_id}`, () => this.slideToNext(!1, !0));
      });
  }
  reenableClickAfterSwiping() {
    this.links.off(`click.${this.section_id}`);
  }
  preventClickWhenSwiping() {
    this.links.on(`click.${this.section_id}`, (t) => t.preventDefault());
  }
  updateThenGoToActiveSlide(t, e = !1) {
    (this.active_slide = t),
      this.updateActive(),
      this.goToActiveSlide(e),
      this.setSliderHeight();
  }
  resetHeight() {
    this.getHeights(), this.setSliderHeight();
  }
  removeListeners() {
    this.blocks.off(`shopify:block:select.${this.section_id}`),
      this.container.off(
        `mousedown.${this.section_id} touchstart.${this.section_id}`
      ),
      window.off(
        `theme:swipe:left.${this.section_id} theme:swipe:right.${this.section_id}`
      );
  }
}
customElements.define("carousel-element", Carousel);
class Announcement extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.blocks = this.querySelectorAll(".announcement--block")),
      (this.next_arrow = this.querySelector(".announcement--next")),
      (this.previous_arrow = this.querySelector(".announcement--previous")),
      (this.rotate_frequency = parseInt(
        this.getAttribute("data-rotate-frequency")
      )),
      new IntersectionObserver(([{ isIntersecting: t }], e) => {
        t &&
          (this.getActiveBlocks(),
          this.startTimer(),
          this.addUpdateListeners(),
          this.pageHideListener(),
          e.disconnect(),
          Shopify.designMode) &&
          1 < this.blocks.length &&
          this.editorListeners();
      }).observe(this);
  }
  getActiveBlocks() {
    (this.active_blocks = []),
      this.blocks.forEach((t) => {
        t.removeAttribute("data-index"),
          this.isBlockActive(t) && this.active_blocks.push(t);
      }),
      this.active_blocks.forEach((t, e) => {
        0 === e && t.setAttribute("data-transition-type", "slide-out"),
          t.setAttribute("data-index", e);
      }),
      (this.previous_index = 0),
      (this.next_index = 0),
      this.next_arrow &&
        this.previous_arrow &&
        this.toggleArrows(1 < this.active_blocks.length);
  }
  isBlockActive(t) {
    return (
      ("small" === window.sizeQuery && "small" === t.dataset.mq) ||
      ("medium" === window.sizeQuery && "medium-large" === t.dataset.mq) ||
      ("large" === window.sizeQuery && "medium-large" === t.dataset.mq) ||
      "" === t.dataset.mq
    );
  }
  toggleArrows(t) {
    this.next_arrow.setAttribute("aria-hidden", !t),
      this.previous_arrow.setAttribute("aria-hidden", !t),
      t
        ? this.addArrowListeners()
        : [this.next_arrow, this.previous_arrow].off("click");
  }
  addArrowListeners() {
    this.next_arrow.on("click", () => {
      this.disabled_click ||
        (this.updateIndices(!1),
        this.updateBlocks(),
        this.timer && clearInterval(this.timer));
    }),
      this.previous_arrow.on("click", () => {
        this.disabled_click ||
          (this.updateIndices(!0),
          this.updateBlocks(),
          this.timer && clearInterval(this.timer));
      });
  }
  startTimer() {
    this.active_blocks.length < 2 ||
      (this.timer && clearInterval(this.timer),
      (this.timer = setInterval(() => {
        this.updateIndices(!1), this.updateBlocks();
      }, 1e3 * this.rotate_frequency)));
  }
  resetBlocks() {
    this.active_blocks.forEach((t, e) => {
      var i = e === this.previous_index;
      t.off("transitionend"),
        t.setAttribute("aria-hidden", !i),
        t.setAttribute("data-transition-active", !1),
        t.setAttribute("data-transition-type", i ? "slide-out" : "slide-in");
    });
  }
  updateBlocks() {
    let e = this.active_blocks[this.next_index],
      i = this.active_blocks[this.previous_index];
    this.pending_transition && this.resetBlocks(),
      i.on("transitionend", ({ target: t }) => {
        t == i &&
          ((this.pending_transition = !1),
          e.setAttribute("aria-hidden", !1),
          e.setAttribute("data-transition-active", !0),
          i.setAttribute("aria-hidden", !0),
          i.setAttribute("data-transition-type", "slide-in"),
          i.setAttribute("data-transition-active", !1),
          i.off("transitionend"));
      }),
      e.on("transitionend", ({ target: t }) => {
        t == e &&
          ((this.disabled_click = !1),
          e.setAttribute("data-transition-type", "slide-out"),
          e.setAttribute("data-transition-active", !1),
          e.off("transitionend"));
      }),
      (this.disabled_click = !0),
      (this.pending_transition = !0),
      i.setAttribute("data-transition-active", !0);
  }
  updateIndices(t) {
    (this.previous_index = this.next_index),
      (this.next_index = t
        ? this.previous_index - 1 < 0
          ? this.active_blocks.length - 1
          : this.previous_index - 1
        : this.previous_index + 1 === this.active_blocks.length
        ? 0
        : this.previous_index + 1);
  }
  addUpdateListeners() {
    window.on("theme:mqs:updated", () => {
      this.getActiveBlocks(), this.resetBlocks();
    }),
      new ResizeObserver(() => this.measureHeight()).observe(this);
  }
  pageHideListener() {
    document.on("visibilitychange", () => {
      this.getActiveBlocks(), this.resetBlocks(), this.startTimer();
    });
  }
  measureHeight() {
    document.documentElement.style.setProperty(
      "--announcement--height",
      `${this.offsetHeight}px`
    );
  }
  editorListeners() {
    this.blocks.on("theme:block:deselect", () => {
      this.startTimer();
    }),
      this.blocks.on("theme:block:select", ({ target: t }) => {
        this.isBlockActive(t) &&
          ((this.next_index = parseInt(t.getAttribute("data-index"))),
          (this.previous_index =
            this.next_index - 1 < 0
              ? this.active_blocks.length - 1
              : this.next_index - 1),
          (this.pending_transition = !0),
          this.updateBlocks(),
          this.timer) &&
          clearInterval(this.timer);
      }),
      this.on("theme:section:reorder", () => {
        this.timer && clearInterval(this.timer);
      }),
      document.on("shopify:inspector:activate.Announcement", () => {
        (this.parentNode.style.position = "relative"),
          (this.parentNode.style.top = "unset");
      }),
      document.on("shopify:inspector:deactivate.Announcement", () => {
        requestAnimationFrame(() => this.parentNode.removeAttribute("style"));
      });
  }
}
customElements.define("announcement-bar-element", Announcement);
class CollapsibleRow extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.toggle = this.querySelector(".collapsible-row--toggle")),
      (this.default_state =
        "true" === this.toggle.getAttribute("aria-expanded")),
      (this.content = this.querySelector(".collapsible-row--content")),
      (this.content_wrapper = this.querySelector(".collapsible-row--wrapper")),
      this.toggleListener(),
      this.initResizeObserver();
  }
  disconnectedCallback() {
    this.toggle.off("click keydown");
  }
  toggleListener() {
    this.toggle.on("click keydown", (t) => {
      ("keydown" === t.type && "Enter" !== t.key) ||
        (t.preventDefault(),
        this.setTransitions(
          "true" !== this.toggle.getAttribute("aria-expanded")
        ));
    });
  }
  initResizeObserver() {
    new ResizeObserver(() => this.setTransitions(this.default_state)).observe(
      this.toggle
    );
  }
  setTransitions(t) {
    this.content_wrapper &&
      (this.toggle.setAttribute("aria-expanded", t),
      this.content_wrapper.setAttribute("data-transition-active", t),
      (this.content_wrapper.style.height = t
        ? `${this.content.offsetHeight}px`
        : "0px"));
  }
}
customElements.define("collapsible-row-element", CollapsibleRow);
class ConsentTracking extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.accept = this.querySelector(".popup--block--accept")),
      (this.decline = this.querySelector(".popup--block--decline")),
      (this.limit = "true" === this.parentNode.getAttribute("data-limit")),
      this.eventListeners(),
      window.Shopify &&
        window.Shopify.loadFeatures([
          {
            name: "consent-tracking-api",
            version: "0.1",
            onLoad: () => {
              var t, e, i, s;
              window.Shopify.customerPrivacy &&
              (({
                marketing: t,
                analytics: e,
                preferences: i,
              } = window.Shopify.customerPrivacy.currentVisitorConsent()),
              (s = "" === t && "" === e && "" === i),
              window.Shopify.customerPrivacy.shouldShowBanner()) &&
              s
                ? Shopify.designMode || this.open()
                : Popup && Popup.loadNext();
            },
          },
        ]);
  }
  eventListeners() {
    [this.accept, this.decline].on("click", ({ target: t }) => {
      window.Shopify.customerPrivacy.setTrackingConsent(
        {
          analytics: t === this.accept,
          marketing: t === this.accept,
          preferences: t === this.accept,
        },
        () => {
          this.close(), !this.limit && Popup && Popup.loadNext();
        }
      );
    }),
      Shopify.designMode &&
        (this.on("theme:block:deselect", () => this.close()),
        this.on("theme:block:select", () => {
          this.off("transitionend"), this.open();
        }));
  }
  open() {
    this.setAttribute("aria-hidden", !1),
      requestAnimationFrame(() =>
        this.setAttribute("data-transition-active", !0)
      );
  }
  close() {
    this.setAttribute("data-transition-active", !1),
      this.on("transitionend", () => this.setAttribute("aria-hidden", !0), {
        once: !0,
      });
  }
}
customElements.define("consent-tracking", ConsentTracking);
class CountdownTimer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.container = this.closest("[data-countdown-container]")),
      (this.digits = this.querySelectorAll(".countdown-timer--digit")),
      (this.hide_when_expired =
        "true" === this.getAttribute("data-hide-expired")),
      (this.show_button_when = this.getAttribute("data-show-button-when")),
      (this.buttons = this.container?.querySelectorAll(
        '[data-item*="button"], [data-item="block-link"]'
      ));
    var t = this.getAttribute("data-expiry-date").split("-"),
      e = this.getAttribute("data-expiry-hours"),
      i = this.getAttribute("data-expiry-minutes");
    (this.countdown_date = this.initDate(...t, e, i)),
      this.addIntersectionObserver();
  }
  disconnectedCallback() {
    this.timer && clearInterval(this.timer);
  }
  addIntersectionObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        this.timer && clearInterval(this.timer),
          t && (this.initTimer(), this.startTimer(), this.addStateListener());
      },
      { rootMargin: `${window.innerHeight / 2}px 0px` }
    ).observe(this);
  }
  initDate(t, e, i, s, r) {
    let a;
    return (
      Utils.areNumericStrings(t, e, i)
        ? (a = new Date(Date.UTC(i, e - 1, t, s, r)))
        : ((a = new Date()).setHours(0, 0, 0, 0), a.setDate(a.getDate() + 1)),
      a.getTime()
    );
  }
  addStateListener() {
    this.digits.on("transitionend", ({ target: t }) => {
      "slide-out" === t.getAttribute("data-transition-type") &&
        t.setAttribute("data-transition-type", "");
    });
  }
  initTimer() {
    var t = new Date().getTime(),
      e = new Date(t).getTime();
    (this.distance = this.countdown_date - e), this.updateTime();
  }
  startTimer() {
    this.timer = setInterval(() => {
      (this.distance -= 1e3), this.updateTime();
    }, 1e3);
  }
  updateTime() {
    var t;
    this.checkIfFinished() || ((t = this.getDigits()), this.renderDigits(t));
  }
  checkIfFinished() {
    return 0 < this.distance
      ? (this.buttons.length &&
          "finished" === this.show_button_when &&
          this.buttons.forEach((t) => t.setAttribute("aria-hidden", !0)),
        !1)
      : (clearInterval(this.timer),
        this.container &&
          (this.hide_when_expired
            ? this.container.setAttribute("aria-hidden", !0)
            : 0 !== this.buttons.length &&
              ("finished" === this.show_button_when
                ? this.buttons.forEach((t) => t.setAttribute("aria-hidden", !1))
                : "active" === this.show_button_when &&
                  this.buttons.forEach((t) =>
                    t.setAttribute("aria-hidden", !0)
                  ))),
        !0);
  }
  getDigits() {
    var t = Math.floor((this.distance % 6e4) / 1e3),
      e = 9 < t ? t.toString().split("").map(Number) : [0, t],
      i = Math.floor((this.distance % 36e5) / 6e4),
      s = 9 < i ? i.toString().split("").map(Number) : [0, i],
      r = Math.floor((this.distance % 864e5) / 36e5),
      a = 9 < r ? r.toString().split("").map(Number) : [0, r],
      o = Math.floor(this.distance / 864e5);
    return [
      ...(99 < o
        ? [9, 9]
        : 9 < o
        ? o.toString().split("").map(Number)
        : [0, o]),
      ...a,
      ...s,
      ...e,
    ];
  }
  renderDigits(a) {
    this.digits.forEach((t, e) => {
      var i,
        s,
        r = a[e];
      r !== parseInt(t.dataset.value) &&
        (t.setAttribute("data-value", r),
        (i = parseInt(t.getAttribute("data-index"))),
        t.setAttribute("data-index", (s = 0 === i ? 1 : 0)),
        (t.children[s].textContent = r),
        t.children[s].setAttribute("data-transition-type", "slide-in"),
        t.children[i].setAttribute("data-transition-type", "slide-out"));
    });
  }
}
customElements.define("countdown-timer", CountdownTimer);
class Disclosure extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.current_option = this.querySelector(".disclosure--current-option")),
      (this.form = this.querySelector(".disclosure--form")),
      (this.input = this.querySelector('[data-item="disclosure"]')),
      (this.links = this.querySelectorAll(".disclosure--option")),
      (this.toggle = this.querySelector(".disclosure--toggle")),
      (this.type = this.getAttribute("data-type")),
      (this.viewport = this.closest(".drawer--side, .layout--viewport")),
      (this.toggle_and_form_gap = 8),
      (this.window_and_form_gap = 16),
      (this.form_measured = !1),
      this.loadWhenVisible();
  }
  disconnectedCallback() {
    this.intersection_observer?.unobserve(this),
      this.resize_observer?.unobserve(document.body),
      this.off(
        `keydown.Disclosure${this.dataset.id} focusout.Disclosure${this.dataset.id}`
      ),
      this.input.off(`change.Disclosure${this.dataset.id}`),
      this.toggle.off(
        `click.Disclosure${this.dataset.id} keydown.Disclosure${this.dataset.id}`
      ),
      this.links.off(
        `click.Disclosure${this.dataset.id} keydown.Disclosure${this.dataset.id}`
      ),
      window.off(`theme:disclosure:closeAll.Disclosure${this.dataset.id}`),
      window.off(`theme:drawer:left:opened.Disclosure${this.dataset.id}`),
      window.off(`theme:drawer:right:opened.Disclosure${this.dataset.id}`);
  }
  loadWhenVisible() {
    (this.intersection_observer = new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        t && (this.load(), this.intersection_observer.unobserve(this));
      }
    )),
      this.intersection_observer.observe(this);
  }
  load() {
    this.closeListener(),
      this.addResizeListener(),
      this.showFormWhenClick(),
      this.hideFormWhenFocusOut(),
      this.setOptionOnClick(),
      "option-picker" !== this.type && this.optionChangeCallback();
  }
  closeListener() {
    window.on(
      `theme:disclosure:closeAll.Disclosure${this.dataset.id}`,
      ({ detail: t }) => {
        t.except !== this.dataset.id && this.toggleFormDisplay(!1);
      }
    );
  }
  addResizeListener() {
    (this.resize_observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        (this.form_measured = !1), this.toggleFormDisplay(!1);
      });
    })),
      this.resize_observer.observe(document.body);
  }
  showFormWhenClick() {
    this.toggle.on(
      `click.Disclosure${this.dataset.id} keydown.Disclosure${this.dataset.id}`,
      (t) => {
        var e;
        ("keydown" === t.type && "Enter" !== t.key) ||
          (t.preventDefault(),
          (e = "true" === this.toggle.getAttribute("aria-expanded")) ||
            (this.form_measured || this.updateFormPosition(),
            window.trigger("theme:disclosure:closeAll", {
              except: this.dataset.id,
            })),
          this.toggleFormDisplay(!e));
      }
    );
  }
  hideFormWhenFocusOut() {
    this.on(`focusout.Disclosure${this.dataset.id}`, ({ relatedTarget: t }) => {
      this.form.contains(t) || this.toggleFormDisplay(!1);
    }),
      this.on(`keydown.Disclosure${this.dataset.id}`, ({ key: t }) => {
        "Escape" === t && (this.toggleFormDisplay(!1), this.toggle.focus());
      });
  }
  setOptionOnClick() {
    this.links.on(
      `click.Disclosure${this.dataset.id} keydown.Disclosure${this.dataset.id}`,
      ({ key: t, type: e, target: i }) => {
        if ("Enter" === t) this.toggle.focus();
        else if ("keydown" === e) return;
        var s = i.dataset.value,
          r = i.getAttribute("data-option-value-id"),
          a = i.getAttribute("data-product-url"),
          o = i.innerHTML;
        this.toggleFormDisplay(!1),
          (this.current_option.innerHTML = o),
          this.links.forEach((t) => t.setAttribute("aria-current", !1)),
          i.setAttribute("aria-current", !0),
          (this.input.value = s),
          this.input.setAttribute("data-option-value-id", r),
          this.input.setAttribute("data-product-url", a),
          this.input.trigger("change");
      }
    );
  }
  toggleFormDisplay(t) {
    this.toggle.setAttribute("aria-expanded", t),
      this.form.setAttribute("data-transition-active", t);
  }
  updateFormPosition() {
    this.form.setAttribute("aria-hidden", !1);
    var { toggle: t, form: e, viewport: i } = this.getMeasurements(),
      s = t.pos.top,
      r = i.height - s - t.height,
      a = i.width - t.pos.left;
    let o = this.toggle_and_form_gap,
      n = 0;
    e.height + this.toggle_and_form_gap > r &&
      r < s &&
      (o = -(e.height + t.height + this.toggle_and_form_gap)),
      "option-picker" !== this.type &&
        e.width > a &&
        (n = -(e.width - a + this.window_and_form_gap)),
      this.style.setProperty(
        "--form-transform",
        `translate3d(${n.toFixed(4)}px, ${o.toFixed(4)}px, 0)`
      );
  }
  getMeasurements() {
    return {
      toggle: { height: this.toggle.offsetHeight, pos: this.offset() },
      form: { width: this.form.offsetWidth, height: this.form.offsetHeight },
      viewport: {
        width: this.viewport.offsetWidth,
        height: this.viewport.offsetHeight,
      },
    };
  }
  optionChangeCallback() {
    this.input.on(`change.Disclosure${this.dataset.id}`, ({ target: t }) => {
      "url-redirect" === this.type
        ? (window.location.href = t.value)
        : "localization" === this.type && t.closest("form").submit();
    });
  }
}
customElements.define("disclosure-element", Disclosure);
class ElementRelocator extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var t = this.getAttribute("data-move-into");
    (this.element_to_move_into = document.querySelector(t)),
      (this.element_to_move = this.firstElementChild),
      this.element_to_move_into && this.element_to_move && this.moveElement();
  }
  disconnectedCallback() {
    this.element_to_move_into.innerHTML = "";
  }
  moveElement() {
    requestAnimationFrame(() => {
      this.element_to_move_into.replaceChildren(this.element_to_move);
    });
  }
}
customElements.define("element-relocator", ElementRelocator);
class Header extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.primary_nav = this.querySelector(".header--primary-nav")),
      (this.container = this.primary_nav.parentNode),
      (this.split_announcement = document.querySelector(
        ".split-announcements--root"
      )),
      (this.x_gap_and_padding = 160),
      (this.layout = this.getAttribute("data-layout")),
      (this.logo = this.querySelector(".header--logo")),
      (this.scroll_hide = "true" === this.getAttribute("data-scroll-hide")),
      (this.secondary_nav = this.querySelector(".header--secondary-nav")),
      (this.sticky_enabled =
        "true" === this.getAttribute("data-sticky-enabled")),
      (this.transparent_enabled =
        "true" === this.getAttribute("data-transparent-enabled")),
      (this.overlap_behavior = this.getAttribute("data-overlap-behavior")),
      (this.prev_scroll_pos = window.scrollY),
      (this.x_menu = this.primary_nav.querySelector(".x-menu")),
      (this.viewport = document.querySelector(".layout--viewport")),
      (this.width = 0),
      this.addResizeObserver(),
      this.sticky_enabled && this.addScrollListener(),
      Shopify.designMode && this.addShopifyListeners(),
      this.setAttribute("data-loaded", !0);
  }
  disconnectedCallback() {
    window.off("scroll.Header");
  }
  addResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => {
        this.width !== this.offsetWidth &&
          ((this.width = this.offsetWidth),
          this.updatePosition(),
          this.measureHeight(),
          this.checkHorizontalOverflow(),
          this.sticky_enabled) &&
          this.scrollCallback();
      });
    }).observe(this);
  }
  updatePosition() {
    var t,
      e,
      i = [...this.parentNode.parentElement?.children]
        .slice(0, this.parentNode.index())
        .reduce((t, e) => t + e.offsetHeight, 0),
      s = parseInt(getComputedStyle(this.parentNode).top) || 0;
    (this.top = i - s),
      "true" === this.viewport?.getAttribute("data-show-border") &&
        ((t = getComputedStyle(document.documentElement)),
        (e =
          "small" === window.sizeQuery
            ? "--border--width-mobile"
            : "--border--width"),
        (this.top += parseInt(t.getPropertyValue(e)) || 0));
  }
  checkHorizontalOverflow() {
    "drawer" != this.layout && this.enableOverlap(!1);
    var t = this.checkOverlap();
    this.primary_nav.setAttribute("aria-hidden", !1),
      "drawer" != this.layout && this.enableOverlap(t);
  }
  checkOverlap() {
    switch (this.layout) {
      case "center-left":
        var t = this.primary_nav.getBoundingClientRect().right,
          e = this.logo.getBoundingClientRect().left;
        return e < t + 16;
      case "left-center":
      case "left-left":
        return (
          this.x_menu.offsetWidth +
            this.secondary_nav.offsetWidth +
            this.logo.offsetWidth +
            this.x_gap_and_padding >
          this.container.offsetWidth
        );
      case "center-below":
        return this.container.offsetWidth < this.primary_nav.offsetWidth + 96;
    }
  }
  enableOverlap(t) {
    this.setAttribute("aria-expanded", t),
      t
        ? this.setAttribute("data-layout", this.overlap_behavior)
        : this.setAttribute("data-layout", this.layout);
  }
  measureHeight() {
    var t = this.offsetHeight;
    (this.hide_offset = (this.top + window.scrollY + t).toFixed(2)),
      document.documentElement.style.setProperty(
        "--header--height",
        `${t.toFixed(2)}px`
      ),
      this.split_announcement &&
        document.documentElement.style.setProperty(
          "--split-announcement--height",
          `${this.split_announcement.offsetHeight.toFixed(2)}px`
        );
  }
  addScrollListener() {
    window.on(
      "scroll.Header",
      () => requestAnimationFrame(() => this.scrollCallback()),
      { passive: !0 }
    );
  }
  scrollCallback() {
    var t;
    Drawer.status.includes("clos") &&
      "opened" !== Modal.status &&
      ((t = window.scrollY),
      this.setAttribute("data-sticky", this.top < t),
      this.scroll_hide) &&
      (t <= this.hide_offset
        ? (this.setAttribute("aria-hidden", !1),
          document.documentElement.style.setProperty("--header--sticky", 1))
        : (this.setAttribute("aria-hidden", t > this.prev_scroll_pos),
          document.documentElement.style.setProperty(
            "--header--sticky",
            t > this.prev_scroll_pos ? 0 : 1
          )),
      (this.prev_scroll_pos = t));
  }
  addShopifyListeners() {
    document.on("shopify:inspector:activate.Header", () => {
      this.setAttribute("data-sticky-enabled", !1);
    }),
      document.on("shopify:inspector:deactivate.Header", () => {
        requestAnimationFrame(() =>
          this.setAttribute("data-sticky-enabled", this.sticky_enabled)
        );
      }),
      document.on("shopify:section:load shopify:section:unload", () => {
        requestAnimationFrame(() => this.updatePosition());
      }),
      this.on("shopify:block:deselect", () => {
        this.setAttribute("data-sticky", !1);
      }),
      this.on("shopify:block:select", () => {
        this.setAttribute("data-sticky", !0);
      }),
      this.on("theme:section:load", () => {
        window.trigger("theme:drawer:loadTriggers"), this.measureHeight();
      });
  }
}
customElements.define("header-element", Header);
class ImageComparisonSection extends HTMLElement {
  constructor() {
    super(),
      (this.container = this.querySelector(".image-comparison--images")),
      (this.cursor = this.querySelector(".image-comparison--cursor")),
      (this.direction = this.getAttribute("data-cursor-direction")),
      (this.section_id = this.getAttribute("data-section-id")),
      (this.text_containers = this.querySelectorAll(
        ".image-comparison--before-text, .image-comparison--after-text"
      ));
  }
  connectedCallback() {
    this.transitionObserver(),
      this.getDimensions(),
      this.mouseDownListener(),
      this.initResizeObserver();
  }
  transitionObserver() {
    this.on("transitionend", ({ target: t }) => {
      t === this.cursor.parentNode &&
        (this.style.setProperty("--image-comparison--transition", "none"),
        this.off("transitionend"));
    }),
      new IntersectionObserver(
        ([{ isIntersecting: t }], e) => {
          t &&
            (e.disconnect(),
            this.setCursor(this.getAttribute("data-initial-pos")));
        },
        { threshold: 0.3 }
      ).observe(this.container);
  }
  setCursor(t) {
    this.style.setProperty("--image-comparison--cursor-pos", `${t}%`);
  }
  getDimensions() {
    var t = this.container.getBoundingClientRect();
    (this.total = "horizontal" === this.direction ? t.width : t.height),
      (this.offset = "horizontal" === this.direction ? t.left : t.top);
  }
  initResizeObserver() {
    new ResizeObserver(() => this.getDimensions()).observe(this);
  }
  mouseDownListener() {
    this.cursor.on(
      "mousedown touchstart",
      () => {
        this.style.setProperty("--image-comparison--transition", "none"),
          this.mouseUpListener(),
          this.dragBegin();
      },
      { passive: !0 }
    );
  }
  mouseUpListener() {
    window.on(
      "mouseup touchend",
      () => {
        (Utils.disable_swipe_listener = !1),
          this.toggleText(!0),
          this.dragEnd();
      },
      { passive: !0, once: !0 }
    );
  }
  dragBegin() {
    var t = window.matchMedia("(pointer: coarse)").matches;
    let e = "vertical" === this.direction && t;
    (Utils.disable_swipe_listener = !0),
      this.toggleText(!1),
      (this.container_rect = this.container.getBoundingClientRect()),
      window.on(
        `mousemove.${this.section_id} touchmove.${this.section_id}`,
        (t) => {
          Utils.disable_swipe_listener &&
            (e && t.preventDefault(),
            requestAnimationFrame(() => this.moveCursor(t)));
        },
        { passive: !e }
      );
  }
  dragEnd() {
    (Utils.disable_swipe_listener = !1),
      this.toggleText(!0),
      window.off(`mousemove.${this.section_id} touchmove.${this.section_id}`);
  }
  toggleText(e) {
    this.text_containers.length &&
      this.text_containers.forEach((t) =>
        t.setAttribute("data-transition-active", e)
      );
  }
  moveCursor(t) {
    let e, i;
    "horizontal" === this.direction
      ? ((i = ("touchmove" === t.type ? t.targetTouches[0] : t).clientX),
        (e = (
          ((i - this.container_rect.left) / this.container_rect.width) *
          100
        ).toFixed(2)))
      : "vertical" === this.direction &&
        ((i = ("touchmove" === t.type ? t.targetTouches[0] : t).clientY),
        (e = (
          ((i - this.container_rect.top) / this.container_rect.height) *
          100
        ).toFixed(2))),
      95 < e ? (e = 95) : e < 5 && (e = 5),
      this.setCursor(e);
  }
}
customElements.define("image-comparison-element", ImageComparisonSection);
class MainProductCarousel extends Carousel {
  constructor() {
    super();
  }
  load() {
    super.load(), this.updateMediaListener(), this.onSlideFinishedListener();
    var t = this.querySelector('.product-media--root[data-active="true"]');
    this.goToSlide(t ? t.dataset.id : 0);
  }
  updateMediaListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged`,
      ({ detail: { variant: t } }) => {
        var e = t.featured_media ? parseInt(t.featured_media.id) : 0;
        this.goToSlide(e);
      }
    );
  }
  onSlideFinishedListener() {
    let i = this.querySelectorAll(".product-media--root");
    this.container.on("transitionend", () => {
      var t = this.active_slide - 1,
        e = i[t];
      i.not(e).forEach((t) => t.firstChild.trigger("pauseMedia"));
    });
  }
  goToSlide(t) {
    var e, i;
    0 !== t &&
      (e = this.querySelector(`.product-media--root[data-id='${t}']`)) &&
      ((i = e.closest(".carousel--block").index() + 1),
      this.updateThenGoToActiveSlide(i));
  }
  checkForActiveModel(t) {
    var e = t.querySelector("model-viewer");
    return !!e && !e.classList.contains("shopify-model-viewer-ui__disabled");
  }
}
customElements.define("main-product-carousel", MainProductCarousel);
class MapSection extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.address = this.getAttribute("data-address")),
      (this.center = null),
      (this.container = this.querySelector(".map--google-maps")),
      (this.key = this.getAttribute("data-api-key")),
      (this.styles = null),
      (this.theme = this.getAttribute("data-theme")),
      "" !== this.key &&
        new IntersectionObserver(
          ([{ isIntersecting: t }], e) => {
            t &&
              (Utils.scriptLoader(
                `google_maps_${this.key}`,
                `https://maps.googleapis.com/maps/api/js?key=${this.key}`,
                () => this.load()
              ),
              e.unobserve(this));
          },
          { rootMargin: `${2 * window.innerHeight}px 0px` }
        ).observe(this);
  }
  load() {
    new google.maps.Geocoder().geocode({ address: this.address }, (t, e) => {
      "OK" === e
        ? ((this.center = t[0].geometry.location),
          this.buildStyles(),
          this.buildMap(),
          this.initResizeObserver())
        : console.error("Google Maps: couldn't convert address with geocoder");
    });
  }
  buildMap() {
    (this.map = new google.maps.Map(this.container, {
      zoom: 15,
      center: this.center,
      disableDefaultUI: !0,
      zoomControl: !0,
      scrollwheel: !1,
      styles: this.styles,
    })),
      new google.maps.Marker({ map: this.map, position: this.center });
  }
  buildStyles() {
    "grayscale" === this.theme
      ? (this.styles = [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [{ color: "#bdbdbd" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#e5e5e5" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#dadada" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ color: "#e5e5e5" }],
          },
          {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9c9c9" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
        ])
      : "dark" === this.theme &&
        (this.styles = [
          { elementType: "geometry", stylers: [{ color: "#212121" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#212121" }],
          },
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "administrative.country",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "administrative.land_parcel",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#bdbdbd" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#181818" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#1b1b1b" }],
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [{ color: "#2c2c2c" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8a8a8a" }],
          },
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#373737" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#3c3c3c" }],
          },
          {
            featureType: "road.highway.controlled_access",
            elementType: "geometry",
            stylers: [{ color: "#4e4e4e" }],
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            featureType: "transit",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#3d3d3d" }],
          },
        ]);
  }
  initResizeObserver() {
    new ResizeObserver(() => this.map.setCenter(this.center)).observe(this);
  }
}
customElements.define("map-element", MapSection);
class MasonryGrid extends HTMLElement {
  constructor() {
    super(), (this.masonry = !1);
  }
  connectedCallback() {
    Utils.scriptLoader("masonry", Shopify.routes.libraries.masonry, () => {
      this.resizeListener(), this.loadMasonry();
    });
  }
  loadMasonry() {
    if ("small" !== window.sizeQuery && window.Masonry) {
      var e = `.${this.childNodes[0].classList[0]}`;
      let t = getComputedStyle(this).getPropertyValue("--grid-column-gap");
      (t = t ? parseInt(t.replace("px", "")) : 0),
        (this.masonry = new Masonry(this, {
          itemSelector: e,
          percentPosition: !0,
          horizontalOrder: !0,
          columnWidth: e,
          gutter: t,
          transitionDuration: "0.2s",
          initLayout: !1,
        })),
        this.masonry.once("layoutComplete", () => {
          window.trigger("theme:masonry:layoutComplete"),
            this.setAttribute("data-masonry-loaded", !0);
        }),
        this.masonry.layout();
    }
  }
  resizeListener() {
    window.on("theme:mqs:updated", () => {
      "small" === window.sizeQuery || this.masonry
        ? "small" === window.sizeQuery && this.masonry && this.unloadMasonry()
        : this.loadMasonry();
    });
  }
  unloadMasonry() {
    this.setAttribute("data-masonry-loaded", !1),
      this.masonry.destroy(),
      (this.masonry = !1);
  }
}
customElements.define("masonry-grid-element", MasonryGrid);
class Navigation extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    "loading" === document.readyState
      ? window.on("DOMContentLoaded", () => this.load())
      : this.load();
  }
  load() {
    this.initGrid(),
      this.initNavigation(),
      this.initFilter(),
      this.navigationListener(),
      Shopify.designMode && window.trigger("theme:drawer:loadTriggers");
  }
  initGrid() {
    (this.body = document.querySelector("[data-body-wrapper]")),
      (this.grid_container = this.body.querySelector("[data-body-grid]")),
      (this.max_columns = parseInt(this.body.getAttribute("data-max-columns"))),
      (this.num_columns = parseInt(
        this.grid_container.getAttribute("data-columns")
      )),
      (this.pagination = this.body.querySelector("[data-body-pagination]")),
      (this.pagination_link = this.body.querySelector(
        "[data-body-pagination-link]"
      )),
      (this.section_id = this.body.parentNode.getAttribute("data-section-id")),
      (this.spinner = this.body.querySelector("[data-body-spinner]"));
  }
  initNavigation() {
    (this.active_price_tag = this.querySelector(
      '.navigation--active-tag[data-type="price"]'
    )),
      (this.active_min =
        this.active_price_tag.querySelector("[data-min-price]")),
      (this.active_max =
        this.active_price_tag.querySelector("[data-max-price]")),
      (this.active_refine_tag = this.querySelector(
        '.navigation--active-tag[data-type="refine"]'
      )),
      (this.active_sort_tag = this.querySelector(
        '.navigation--active-tag[data-type="sort"]'
      )),
      (this.active_tags_container = this.querySelector(
        ".navigation--tags-container"
      )),
      (this.active_tags_wrapper = this.querySelector(
        ".navigation--active-tags"
      )),
      (this.clear_tags_button = this.querySelector(
        ".navigation--active-clear"
      )),
      (this.layout_buttons = this.querySelectorAll(
        ".navigation--layout-button"
      )),
      (this.local_storage_name = `${Shopify.theme.name}:${this.getAttribute(
        "data-storage-name"
      )}`),
      (this.navigation_buttons = this.querySelectorAll(
        ".navigation--button, .navigation--mobile-button"
      )),
      (this.small_layout_button = this.layout_buttons[1]),
      (this.url = this.getAttribute("data-url")),
      this.layout_buttons.length && 2 < this.max_columns
        ? (this.initLayout(), this.setLayout(), this.layoutListener())
        : this.layout_buttons.forEach((t) => (t.style.display = "none"));
  }
  initFilter() {
    (this.filter = document.querySelector(".filter--root")),
      this.filter &&
        ((this.browse_links = this.filter.querySelectorAll(
          '[data-type="browse"] .filter--label'
        )),
        (this.current_sort_input = this.filter.querySelector(
          '[data-type="sort"] .filter--input:checked'
        )),
        (this.filter_form = this.filter.querySelector(".filter--form")),
        (this.menu_toggles = this.filter.querySelectorAll(".filter--toggle")),
        (this.price_range = this.filter.querySelector(".price-range--wrapper")),
        (this.refine_links = this.filter.querySelectorAll(
          '[data-type="refine"] .filter--label'
        )),
        (this.reset_button = this.filter.querySelector(
          '.filter--button[data-type="reset"]'
        )),
        (this.sort_links = this.filter.querySelectorAll(
          '[data-type="sort"] .filter--label'
        )),
        this.menu_toggles.length &&
          (this.menuToggleListeners(), this.clearAllListener()),
        this.browse_links.length && this.browseListener(),
        this.sort_links.length &&
          (this.current_sort_input &&
            ((this.current_sort_link =
              this.current_sort_input.nextElementSibling),
            (this.current_sort_value = this.current_sort_input.value),
            (this.current_sort_label =
              this.current_sort_input.getAttribute("data-label"))),
          this.sortListener(),
          this.renderActiveSort(),
          this.activeSortListener()),
        this.refine_links.length &&
          (this.refineListener(), this.renderActiveRefines()),
        this.price_range &&
          (this.renderActivePriceListener(),
          this.getNewProductsListener(),
          this.activePriceListener()),
        this.toggleActiveTags());
  }
  navigationListener() {
    this.navigation_buttons.on(
      "click keydown",
      ({ key: t, target: e, type: i }) => {
        ("keydown" === i && "Enter" !== t) ||
          this.toggleFilterMenu(e.getAttribute("data-toggle-menu"));
      }
    );
  }
  toggleFilterMenu(e) {
    document.querySelectorAll(".filter--toggle").forEach((t) => {
      t.setAttribute("aria-expanded", !1),
        t.nextElementSibling.setAttribute("data-transition-active", !1),
        t.getAttribute("aria-controls").includes(e) && t.click();
    });
  }
  initLayout() {
    this.layout_buttons.forEach((t) => t.removeAttribute("style")),
      this.small_layout_button.setAttribute(
        "data-column-size",
        this.max_columns
      );
  }
  setLayout() {
    let e = parseInt(localStorage.getItem(this.local_storage_name));
    (e && (2 === e || e === this.num_columns)) ||
      ((e = this.num_columns),
      localStorage.setItem(this.local_storage_name, e)),
      this.grid_container.setAttribute("data-columns", e),
      this.layout_buttons.forEach((t) => {
        t.setAttribute("data-active", !1),
          parseInt(t.getAttribute("data-column-size")) === e &&
            t.setAttribute("data-active", !0);
      });
  }
  layoutListener() {
    this.layout_buttons.off("click keydown"),
      this.layout_buttons.on("click keydown", (t) => {
        var e;
        ("keydown" === t.type && "Enter" !== t.key) ||
          ((e = parseInt(t.target.getAttribute("data-column-size"))),
          localStorage.setItem(this.local_storage_name, e),
          this.setLayout());
      });
  }
  menuToggleListeners() {
    this.menu_toggles.on("click keydown", (i) => {
      if ("keydown" !== i.type || "Enter" === i.key) {
        var s = i.target;
        let t = "true" !== s.getAttribute("aria-expanded"),
          e = (s.setAttribute("aria-expanded", t), s.nextElementSibling);
        requestAnimationFrame(() => {
          e.setAttribute("data-transition-active", t);
        });
      }
    });
  }
  clearAllListener() {
    [this.clear_tags_button, this.reset_button].on("click keydown", (t) => {
      ("keydown" === t.type && "Enter" !== t.key) ||
        (this.current_sort_link && this.current_sort_link.click(),
        window.trigger("theme:priceRange:clear"),
        this.active_refine_tags.length &&
          this.active_refine_tags.forEach((t) => t.trigger("click")),
        t.target.focus());
    });
  }
  browseListener() {
    this.browse_links.on("click keydown", (s) => {
      if ("keydown" !== s.type || "Enter" === s.key) {
        let t = s.target.previousElementSibling,
          e = !1,
          i;
        t.checked && (e = !0),
          requestAnimationFrame(() => {
            (i = e
              ? ((t.checked = !1), Shopify.routes.all_products_collection)
              : t.value),
              (location.href = `${location.origin}${i}`),
              setTimeout(() => Drawer.close(), 350);
          });
      }
    });
  }
  sortListener() {
    this.sort_links.on("click keydown", (s) => {
      if ("keydown" !== s.type || "Enter" === s.key) {
        let t = s.target,
          e = t.previousElementSibling,
          i = !1;
        e.checked && (i = !0),
          requestAnimationFrame(() => {
            i
              ? ((e.checked = !1),
                (this.current_sort_link = !1),
                (this.current_sort_label = !1),
                (this.current_sort_value = !1))
              : ((e.checked = !0),
                (this.current_sort_link = t),
                (this.current_sort_label = e.dataset.label),
                (this.current_sort_value = e.value)),
              this.showLoadingView(),
              this.renderActiveSort(),
              this.getAjaxUrl();
          });
      }
    });
  }
  refineListener() {
    this.refine_links.on("click keydown", (t) => {
      var e;
      ("keydown" === t.type && "Enter" !== t.key) ||
        ("Enter" === t.key &&
          ((e = t.target.previousElementSibling).checked = !e.checked),
        requestAnimationFrame(() => {
          this.clearRefineTags(),
            this.showLoadingView(),
            this.renderActiveRefines(),
            this.getAjaxUrl();
        }));
    });
  }
  clearRefineTags() {
    var t = this.active_tags_wrapper.querySelectorAll(
      '.navigation--active-tag[data-type="refine"]'
    );
    t.length && t.forEach((t) => t.remove());
  }
  getNewProductsListener() {
    window.on("theme:navigation:loadNewProducts", () => {
      this.showLoadingView(), this.getAjaxUrl();
    });
  }
  getAjaxUrl() {
    var t = new FormData(this.filter_form),
      e = new URLSearchParams(t);
    (this.ajax_url = `${this.url}${e.toString()}`),
      history.replaceState({}, "", this.ajax_url),
      this.getGridHtml(),
      this.toggleActiveTags();
  }
  showLoadingView() {
    (this.grid_container.innerHTML = ""),
      [this.grid_container, this.pagination].forEach(
        (t) => (t.style.display = "none")
      ),
      this.spinner.setAttribute("aria-hidden", !1);
  }
  async getGridHtml() {
    this.abort_controller && this.abort_controller.abort(),
      (this.abort_controller = new AbortController());
    try {
      if (
        ((this.response = await fetch(this.ajax_url, {
          signal: this.abort_controller.signal,
        })),
        !this.response.ok)
      )
        throw new Error(response.statusText);
      var t = (await this.response.text()).parse("[data-body-wrapper]");
      this.renderGridHtml(t),
        this.spinner.setAttribute("aria-hidden", !0),
        this.grid_container.removeAttribute("style"),
        requestAnimationFrame(() => this.loadTransitions()),
        window.trigger("theme:navigation:reloaded");
    } catch {}
  }
  renderGridHtml(t) {
    var e = t.querySelector("[data-body-grid]").innerHTML,
      i =
        ((this.grid_container.innerHTML = e),
        t.querySelector("[data-body-pagination]"));
    i
      ? ((this.pagination.innerHTML = i.innerHTML),
        this.pagination.removeAttribute("style"),
        this.pagination_link && (this.pagination_link.style.display = "block"))
      : this.pagination_link && (this.pagination_link.style.display = "none");
  }
  loadTransitions() {
    [
      ...this.grid_container.querySelectorAll("[data-transition-container]"),
    ].map((t) => {
      var e = t.getAttribute("data-transition-container");
      window.trigger(`theme:transition:reload:${e}`);
    }),
      window.trigger(`theme:transition:reload:${this.section_id}`);
  }
  renderActiveSort() {
    this.current_sort_value
      ? ((this.render_active_sort = !0),
        (this.active_sort_tag.querySelector("span").textContent =
          this.current_sort_label),
        this.active_sort_tag.setAttribute(
          "data-value",
          this.current_sort_value
        ),
        this.active_sort_tag.removeAttribute("style"))
      : ((this.render_active_sort = !1),
        (this.active_sort_tag.style.display = "none"));
  }
  renderActivePriceListener() {
    window.on("theme:priceRange:renderActive", ({ detail: t }) => {
      0 === t.current_min && t.current_max === t.max
        ? ((this.active_price_tag.style.display = "none"),
          (this.render_active_price = !1))
        : ((this.render_active_price = !0),
          (this.active_min.textContent = `${t.current_min}`),
          (this.active_max.textContent = `${t.current_max}`),
          this.active_price_tag.removeAttribute("style")),
        this.toggleActiveTags();
    });
  }
  renderActiveRefines() {
    (this.active_refine_tags = []), (this.render_active_refine = !1);
    let i = { labels: [], names: [], swatches: [], values: [] };
    if (
      (this.filter
        .querySelectorAll('[data-type="refine"] input:checked')
        .forEach((t) => {
          i.labels.push(t.getAttribute("data-label")),
            i.names.push(t.name),
            i.values.push(t.value);
          var e = t.nextElementSibling;
          "swatch" === e.getAttribute("data-item")
            ? i.swatches.push(e.getAttribute("style"))
            : i.swatches.push(!1);
        }),
      0 < i.values.length)
    ) {
      var t = new DocumentFragment();
      for (let e = 0; e < i.values.length; e++) {
        var s = this.active_refine_tag.cloneNode(!0),
          r =
            (s.removeAttribute("style"),
            s.setAttribute("data-value", i.values[e]),
            s.setAttribute("data-name", i.names[e]),
            (s.querySelector("span").textContent = i.labels[e]),
            s.querySelectorAll('[class*="swatch"]'));
        i.swatches[e] && r.length
          ? r.forEach((t) => t.setAttribute("style", i.swatches[e]))
          : r.length && r.forEach((t) => t.remove()),
          t.prepend(s),
          this.active_refine_tags.push(s);
      }
      this.active_tags_wrapper.prepend(t),
        (this.render_active_refine = !0),
        this.activeRefineListeners();
    }
  }
  toggleActiveTags() {
    var t =
      this.render_active_refine ||
      this.render_active_sort ||
      this.render_active_price;
    this.active_tags_container.style.display = t ? "block" : "none";
  }
  activeSortListener() {
    this.active_sort_tag.on("click keydown", (t) => {
      ("keydown" === t.type && "Enter" !== t.key) ||
        (this.current_sort_link && this.current_sort_link.click());
    });
  }
  activePriceListener() {
    this.active_price_tag.on("click keydown", (t) => {
      ("keydown" === t.type && "Enter" !== t.key) ||
        window.trigger("theme:priceRange:clear");
    });
  }
  activeRefineListeners() {
    this.active_refine_tags.on("click keydown", (t) => {
      if ("keydown" !== t.type || "Enter" === t.key) {
        let r = t.target;
        this.refine_links.forEach((t) => {
          var e = t.previousElementSibling,
            i = r.getAttribute("data-value"),
            s = r.getAttribute("data-name");
          e.value === i && e.name === s && (t.click(), (e.checked = !1));
        });
      }
    });
  }
}
customElements.define("navigation-element", Navigation);
class PasswordPage extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.login_cancel = this.querySelector(".password--cancel")),
      (this.login_link = this.querySelector(".password--login")),
      (this.login_input = this.querySelector('form input[type="password"]')),
      this.loginFormListener(),
      this.cancelLoginListener();
  }
  loginFormListener() {
    this.login_link.on("click", () => {
      this.setAttribute("data-show-login", !0), this.login_input.focus();
    });
  }
  cancelLoginListener() {
    this.login_cancel.on("click", () => {
      this.setAttribute("data-show-login", !1);
    });
  }
}
customElements.define("password-element", PasswordPage);
class Placeholder extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.paths = this.querySelectorAll("path")),
      this.hasAttribute("data-transition-item") &&
        (this.addTransitionObserver(), this.loadWhenVisible());
  }
  addTransitionObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t && (this.setAttribute("data-transition-active", !0), e.disconnect());
      },
      { threshold: 0.2 }
    ).observe(this);
  }
  loadWhenVisible() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t &&
          (this.paths.forEach((t) => {
            var e = Math.ceil(t.getTotalLength());
            t.setStyles({ strokeDasharray: e, strokeDashoffset: e });
          }),
          e.disconnect());
      },
      { rootMargin: `${window.innerHeight}px 0px` }
    ).observe(this);
  }
}
customElements.define("placeholder-element", Placeholder);

class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.form = this.querySelector("form")),
      (this.clear_button = this.querySelector(".search--clear")),
      (this.input = this.querySelector(".search--textbox")),
      (this.results = this.querySelector(".search--results")),
      (this.results_placeholder = this.querySelector('.predictive-search--products')),
      (this.results_grid = this.querySelector('.predictive-search--product-grid')),
      (this.cached_results = { "": this.results.innerHTML }),
      this.addInputListener(),
      this.addFormSubmitListener(),
      this.addClearButtonListener(),
      this.addMutationObserver();
  }
  addInputListener() {
    this.input.on("input", () => {
      var t = this.input.value.trim();
      this.clear_button.setAttribute("aria-hidden", "" === t),
        this.getSearchResults(t);
    });
  }
  async getSearchResults(t) {
    this.abort_controller && this.abort_controller.abort();
    var e = t.trim();
    if (this.cached_results[e]) this.results.innerHTML = this.cached_results[e];
    else {
      (this.abort_controller = new AbortController()), this.toggleLoading(!0);
      try {
        var r = await fetch(
            `${Shopify.routes.search}?type=product&view=json&q=${encodeURIComponent(
            t
          )}`,
          { signal: this.abort_controller.signal }
        );
        if (!r.ok) throw new Error(r.status);
        var s = await r.json();
        var regex = new RegExp('data-transition-item', 'g');
        this.results_placeholder.innerHTML = '';
        console.log(s);
        var self = this;
        s.forEach(function (item) {
          fetch(`/products/${item.handle}?sections=product-card`)
            .then(response => response.json())
            .then(data => self.results_placeholder.insertAdjacentHTML('beforeend', data['product-card'].replace(regex, 'div')));
        })
      } catch { }
    }
  }
  addClearButtonListener() {
    this.clear_button.on("click keydown", (t) => {
      ("keydown" === t.type && "Enter" !== t.key) ||
        (t.preventDefault(),
        (this.input.value = ""),
        this.input.focus(),
        this.input.trigger("input"));
    });
  }
  toggleLoading(t) {
    setTimeout(() => this.setAttribute("data-loading", t), t ? 0 : 100);
  }
  addFormSubmitListener() {
    this.form.on("submit", (t) => {
      t.preventDefault();
      var e = encodeURIComponent(this.input.value.trim());
      window.location.href = `${Shopify.routes.search}?type=product&q=${e}`;
    });
  }
  addMutationObserver() {
    new MutationObserver(() => {
      this.toggleLoading(!1),
        window.trigger("theme:search:reloaded"),
        window.trigger("theme:transition:reload:search");
    }).observe(this.results, { childList: !0 });
  }
}
customElements.define("predictive-search-element", PredictiveSearch);

class PriceRange extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.active_price_tag = document.querySelector(
      '.navigation--active-tag[data-type="price"]'
    )),
      (this.button_min_delta = 32),
      (this.container = this.closest(".filter--menu")),
      (this.price_inputs = this.querySelectorAll(".price-range--input")),
      (this.price_range_buttons = this.querySelectorAll(
        ".price-range--button"
      )),
      (this.price_range_line = this.querySelector(".price-range--line")),
      (this.price_range_transition =
        this.price_range_buttons[0].style.transition);
    var t,
      e,
      i = parseFloat(
        this.price_inputs[1].getAttribute("max").replace(",", ".")
      );
    0 !== i &&
      ((t = parseFloat(this.price_inputs[0].value.replace(",", "."))),
      (e = parseFloat(this.price_inputs[1].value.replace(",", "."))),
      (this.prices = {
        current_min: t,
        pending_min: t,
        current_max: e,
        pending_max: e,
        max: i,
      }),
      (this.allowed_keys = [
        8, 9, 13, 37, 38, 39, 40, 65, 67, 86, 88, 91, 188, 190,
      ]),
      this.priceRangeListeners(),
      this.priceRangeResizeObserver(),
      this.priceInputListeners(),
      this.renderActivePrice(),
      this.clearPriceListener());
  }
  priceRangeResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => this.getPriceRangeGeometry());
    }).observe(this.price_range_line);
  }
  priceInputListeners() {
    this.price_inputs.on("keydown", (t) => {
      !this.allowed_keys.includes(t.which) &&
        (t.which < 48 || 57 < t.which) &&
        t.preventDefault();
    }),
      this.price_inputs.on("change", (t) => {
        var e = t.target,
          i = parseFloat(e.value);
        let s, r;
        e.dataset.hasOwnProperty("minPrice")
          ? i + this.price_min_delta > this.prices.current_max
            ? (i > this.prices.max - this.price_min_delta
                ? ((s = parseFloat(
                    (this.prices.max - this.price_min_delta).toFixed(2)
                  )),
                  (this.prices.current_max = this.prices.max))
                : ((s = i),
                  (this.prices.current_max = parseFloat(
                    (i + this.price_min_delta).toFixed(2)
                  ))),
              (e.value = s),
              (this.prices.current_min = s),
              (this.price_inputs[1].value = this.prices.current_max))
            : (this.prices.current_min = i)
          : e.dataset.hasOwnProperty("maxPrice") &&
            (i > this.prices.max
              ? ((e.value = this.prices.max),
                (this.prices.current_max = this.prices.max))
              : this.prices.current_min + this.price_min_delta > i
              ? (i - this.price_min_delta < 0
                  ? ((r = this.price_min_delta.toFixed(2)),
                    (this.prices.current_min = 0))
                  : ((r = i),
                    (this.prices.current_min = parseFloat(
                      (i - this.price_min_delta).toFixed(2)
                    ))),
                (e.value = r),
                (this.prices.current_max = r),
                (this.price_inputs[0].value = this.prices.current_min))
              : (this.prices.current_max = i)),
          this.getPriceRangePositions(),
          this.movePriceRangeButtons(),
          this.setPriceRangeFill(),
          this.renderActivePrice(),
          window.trigger("theme:navigation:loadNewProducts");
      });
  }
  getPriceRangeGeometry() {
    (this.price_range_width = this.price_range_line.offsetWidth),
      this.price_range_width &&
        ((this.pixels_per_price = this.price_range_width / this.prices.max),
        (this.price_per_pixels = this.prices.max / this.price_range_width),
        (this.price_min_delta =
          this.button_min_delta * (1 / this.pixels_per_price)),
        this.getPriceRangePositions(),
        this.movePriceRangeButtons(),
        this.setPriceRangeFill());
  }
  getPriceRangePositions() {
    this.price_positions = {
      min: this.prices.current_min * this.pixels_per_price,
      max: this.prices.current_max * this.pixels_per_price,
    };
  }
  movePriceRangeButtons() {
    this.price_range_buttons.forEach((t) => {
      t.style.transform = t.dataset.hasOwnProperty("maxPrice")
        ? `translateX(-${this.price_range_width - this.price_positions.max}px)`
        : `translateX(${this.price_positions.min}px)`;
    });
  }
  setPriceRangeFill() {
    var t = this.price_range_line.firstElementChild,
      e = this.price_range_width - this.price_positions.max;
    t.setStyles({
      margin: `0 ${e}px 0 ${this.price_positions.min}px`,
      width: `calc(100% - ${e + this.price_positions.min}px)`,
    });
  }
  priceRangeListeners() {
    this.price_range_buttons.on(
      "mousedown touchstart",
      (t) => {
        this.addMouseUpListener(), this.dragBegin(t);
      },
      { passive: !0 }
    );
  }
  addMouseUpListener() {
    window.on(
      "mouseup touchend",
      () => {
        this.drag_start &&
          ((this.drag_start = !1),
          (Utils.disable_swipe_listener = !1),
          this.dragEnd());
      },
      { passive: !0, once: !0 }
    );
  }
  dragBegin(t) {
    (this.active_range_button = t.target),
      (Utils.disable_swipe_listener = !0),
      (this.drag_start = (
        "touchstart" === t.type ? t.targetTouches[0] : t
      ).pageX),
      window.on(
        "mousemove.priceRange touchmove.priceRange",
        (t) => {
          this.drag_start &&
            requestAnimationFrame(() => this.getNewButtonPosition(t));
        },
        { passive: !0 }
      );
  }
  dragEnd() {
    this.active_range_button.dataset.hasOwnProperty("maxPrice")
      ? ((this.prices.current_max = parseFloat(this.prices.pending_max)),
        (this.price_inputs[1].value = this.prices.current_max))
      : ((this.prices.current_min = parseFloat(this.prices.pending_min)),
        (this.price_inputs[0].value = this.prices.current_min)),
      this.getPriceRangePositions(),
      this.renderActivePrice(),
      window.trigger("theme:navigation:loadNewProducts"),
      window.off("mousemove.priceRange touchmove.priceRange");
  }
  getNewButtonPosition(t) {
    var e = t.type.includes("touch")
      ? t.targetTouches[0].pageX - this.drag_start
      : t.pageX - this.drag_start;
    if (this.active_range_button.dataset.hasOwnProperty("maxPrice")) {
      let t = this.prices.current_max * this.pixels_per_price + e;
      t > this.price_range_width
        ? (t = this.price_range_width)
        : this.price_positions.min > t - this.button_min_delta &&
          (t = this.price_positions.min + this.button_min_delta),
        (this.price_positions.max = t),
        (this.prices.pending_max = (t * this.price_per_pixels).toFixed(2)),
        (this.price_inputs[1].value = this.prices.pending_max);
    } else {
      let t = this.prices.current_min * this.pixels_per_price + e;
      t < 0
        ? (t = 0)
        : t > this.price_positions.max - this.button_min_delta &&
          (t = this.price_positions.max - this.button_min_delta),
        (this.price_positions.min = t),
        (this.prices.pending_min = (t * this.price_per_pixels).toFixed(2)),
        (this.price_inputs[0].value = this.prices.pending_min);
    }
    this.movePriceRangeButtons(), this.setPriceRangeFill();
  }
  renderActivePrice() {
    window.trigger("theme:priceRange:renderActive", this.prices);
  }
  clearPrices() {
    let i = !1;
    this.price_inputs.forEach((t) => {
      var e = parseFloat(t.value);
      t.dataset.hasOwnProperty("minPrice") && 0 !== e
        ? ((t.value = 0), (i = !0))
        : t.dataset.hasOwnProperty("maxPrice") &&
          e !== this.prices.max &&
          ((t.value = this.prices.max), (i = !0));
    }),
      i && this.price_inputs.forEach((t) => t.trigger("change"));
  }
  clearPriceListener() {
    window.on("theme:priceRange:clear", () => this.clearPrices());
  }
}
customElements.define("price-range-element", PriceRange);
class ProductBuyButtons extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.abort_controller = new AbortController()),
      (this.bottom_observer = document.querySelector(".layout--bottom")),
      (this.button_texts = this.querySelectorAll(
        ".product-buy-buttons--cta-text"
      )),
      (this.buy_now_button = this.querySelector(
        ".product-buy-buttons--buy-now"
      )),
      (this.cart_type = this.getAttribute("data-cart-type")),
      (this.change_button = this.querySelector(
        ".product-buy-buttons--drawer-change"
      )),
      (this.drawer = this.querySelector(".product-buy-buttons--drawer")),
      (this.drawer_disabled = !1),
      (this.drawer_variant = this.querySelector(
        ".product-buy-buttons--drawer-variant"
      )),
      (this.form = this.closest("form")),
      (this.input = this.querySelector(".product-buy-buttons--input")),
      (this.main_product = "true" === this.getAttribute("data-main-product")),
      (this.primary_buttons = this.querySelectorAll(
        ".product-buy-buttons--primary"
      )),
      (this.quantity_input = this.form.querySelector("[name=quantity]")),
      (this.smart_button = this.querySelector(".product-buy-buttons--smart")),
      (this.translations = JSON.parse(
        this.querySelector("script").textContent
      )),
      this.initResizeObserver(),
      this.addFormListener(),
      this.updateViewListener(),
      this.buy_now_button && this.addBuyNowListener(),
      this.drawer &&
        (this.addIntersectionObservers(),
        this.windowListeners(),
        this.change_button) &&
        this.changeListener();
  }
  disconnectedCallback() {
    this.abort_controller.abort();
  }
  addFormListener() {
    this.form.on("submit", async (t) => {
      var e = Utils.getQuantity(
        this.dataset.id,
        this.input.dataset,
        this.quantity_input.value
      );
      if (
        ((e && "drawer" !== this.cart_type) ||
          (t.preventDefault(), t.stopPropagation()),
        e)
      ) {
        t.submitter.setAttribute("aria-busy", !0);
        var i = new FormData(this.form),
          s = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `${new URLSearchParams(
              i
            ).toString()}&sections=${Cart.sections.join(",")}`,
          };
        try {
          await Cart.addItems(
            s,
            "drawer" === this.cart_type ? t.submitter : null
          ),
            "drawer" === this.cart_type &&
              this.primary_buttons.forEach((t) =>
                t.setAttribute("aria-busy", !1)
              );
        } catch (t) {
          throw (
            (this.primary_buttons.forEach((t) =>
              t.setAttribute("aria-busy", !1)
            ),
            new Error(t))
          );
        }
      }
    });
  }
  addBuyNowListener() {
    this.buy_now_button.on("click", async () => {
      this.buy_now_button.setAttribute("aria-busy", !0),
        (window.location.href = `${Shopify.routes.root}cart/${this.input.value}:${this.quantity_input.value}`);
    });
  }
  updateViewListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged`,
      ({ detail: { variant: t } }) => {
        this.drawer_variant && (this.drawer_variant.innerText = t.public_title),
          t.id && t.available
            ? (this.selectVariant(t), this.updateView(!0, !0))
            : t.id && !t.available
            ? (this.selectVariant(t), this.updateView(!1, !0))
            : this.updateView(!1, !1);
      }
    );
  }
  addIntersectionObservers() {
    new IntersectionObserver(
      ([{ isIntersecting: t, boundingClientRect: e }]) => {
        !t && e.top <= 0 ? this.openDrawer() : t && this.closeDrawer();
      },
      { threshold: 0 }
    ).observe(this.primary_buttons[0]),
      new IntersectionObserver(
        ([{ isIntersecting: t }]) => {
          t
            ? ((this.reached_bottom = !0), this.closeDrawer())
            : this.reached_bottom &&
              ((this.reached_bottom = !1), this.openDrawer());
        },
        { threshold: 0.1 }
      ).observe(this.bottom_observer);
  }
  openDrawer() {
    (this.pending_open = !0),
      this.drawer_disabled || this.drawer.setAttribute("aria-hidden", !1);
  }
  closeDrawer() {
    (this.pending_open = !1), this.drawer.setAttribute("aria-hidden", !0);
  }
  windowListeners() {
    window.on(
      "theme:popup:opened theme:drawer:left:opening theme:drawer:right:opening theme:feedback:opened",
      () => {
        (this.drawer_disabled = !0),
          this.drawer.setAttribute("aria-hidden", !0);
      },
      { signal: this.abort_controller.signal }
    ),
      window.on(
        "theme:popup:closed theme:drawer:left:closed theme:drawer:right:closed theme:feedback:closed",
        () => {
          (this.drawer_disabled = !1),
            this.pending_open && this.drawer.setAttribute("aria-hidden", !1);
        },
        { signal: this.abort_controller.signal }
      );
  }
  changeListener() {
    this.change_button.on("click", () => {
      var { top: t, height: e } =
        this.primary_buttons[0].getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + t - window.innerHeight + e,
        behavior: "smooth",
      });
    });
  }
  initResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => {
        this.form.style.setProperty(
          "--buy-buttons--height",
          `${this.offsetHeight}px`
        );
      });
    }).observe(this);
  }
  selectVariant({
    id: t,
    sku: e,
    inventory_management: i,
    inventory_policy: s,
    inventory_quantity: r,
  }) {
    (this.input.value = t),
      this.input.setAttribute("data-id", t),
      this.input.setAttribute("data-sku", e),
      this.input.setAttribute("data-management", i),
      this.input.setAttribute("data-policy", s),
      this.input.setAttribute("data-quantity", r);
  }
  updateView(t, i) {
    t
      ? (Shopify.designMode ||
          this.smart_button?.setAttribute("aria-hidden", !1),
        Shopify.designMode || this.buy_now_button?.removeAttribute("disabled"),
        this.primary_buttons.forEach((t) => t.removeAttribute("disabled")),
        this.button_texts.forEach((t) => {
          t.parentElement.setAttribute(
            "data-text",
            this.translations.add_to_cart
          ),
            (t.textContent = this.translations.add_to_cart);
        }))
      : (this.primary_buttons.forEach((t) => t.setAttribute("disabled", !0)),
        this.smart_button?.setAttribute("aria-hidden", !0),
        this.buy_now_button?.setAttribute("disabled", !0),
        this.button_texts.forEach((t) => {
          var e = i
            ? this.translations.out_of_stock
            : this.translations.unavailable;
          t.parentElement.setAttribute("data-text", e), (t.textContent = e);
        }));
  }
}
customElements.define("product-buy-buttons-element", ProductBuyButtons);
class ProductCard extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.swatch_data = {}),
      (this.hover_image = this.querySelector(".product-card--hover-image")),
      (this.main_image = this.querySelector(".product-card--image")),
      (this.inputs = this.querySelectorAll(".swatch--input")),
      (this.product_url = `${Shopify.routes.root}products/${this.getAttribute(
        "data-handle"
      )}`),
      (this.swatch_option_position = `option${this.getAttribute(
        "data-swatch-option-position"
      )}`),
      (this.title_link = this.querySelector(".product-card--title-link")),
      this.inputs.length &&
        new IntersectionObserver(([{ isIntersecting: t }], e) => {
          t &&
            (this.fetchVariantImages(), this.inputListener(), e.disconnect());
        }).observe(this);
  }
  async fetchVariantImages() {
    var e = await fetch(`${this.product_url}.js`);
    if (e.ok) {
      let { variants: t, images: r } = await e.json();
      t.forEach((e) => {
        var t, i, s;
        e.featured_image &&
          ((t = e[this.swatch_option_position]),
          this.swatch_data[t] ||
            ((this.swatch_data[t] = {
              images: [e.featured_image.src.replace("https:", "")],
              variant_id: e.id,
            }),
            (i = r.findIndex((t) => `https:${t}` === e.featured_image.src)),
            this.hover_image &&
              -1 !== i &&
              i < r.length - 1 &&
              ((s = r[i + 1]), this.swatch_data[t].images.push(s))));
      }),
        this.preloadImages(),
        this.disableEmptySwatches();
    }
  }
  preloadImages() {
    Object.entries(this.swatch_data).forEach(([, { images: t }]) => {
      t.forEach((t) => {
        new Image().src = t;
      });
    });
  }
  disableEmptySwatches() {
    this.inputs.forEach((t) => {
      this.swatch_data[t.value] || (t.disabled = !0);
    });
  }
  inputListener() {
    this.inputs.on("change", ({ target: t }) => {
      var e = this.swatch_data[t.value];
      e &&
        ((this.main_image.src = e.images[0]),
        (this.main_image.srcset = ""),
        this.hover_image &&
          e.images[1] &&
          ((this.hover_image.src = e.images[1]),
          (this.hover_image.srcset = "")),
        (this.main_image.parentNode.href = `${this.product_url}?variant=${e.variant_id}`),
        (this.title_link.href = `${this.product_url}?variant=${e.variant_id}`));
    });
  }
}
customElements.define("product-card", ProductCard);
class ProductLabel extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.sale_enabled = "true" === this.getAttribute("data-sale-enabled")),
      (this.sale_type = this.getAttribute("data-sale-type")),
      (this.sold_out_enabled =
        "true" === this.getAttribute("data-sold-out-enabled")),
      (this.text_container = this.querySelector(".product--label-text")),
      (this.translation_json = JSON.parse(
        this.querySelector("script").textContent
      )),
      this.updateListener();
  }
  disconnectedCallback() {
    window.off(`theme:product:${this.dataset.id}:variantChanged.ProductLabel`);
  }
  updateListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged.ProductLabel`,
      ({ detail: { variant: t } }) => {
        var e, i;
        this.sold_out_enabled && !t.available
          ? (this.text_container.textContent =
              this.translation_json.out_of_stock)
          : this.sale_enabled && t.compare_at_price > t.price
          ? "percent" === this.sale_type
            ? ((e = t.compare_at_price - t.price),
              (i = Math.floor((100 * e) / t.compare_at_price)),
              (this.text_container.textContent = `${i}% ${this.translation_json.off}`))
            : (this.text_container.textContent = this.translation_json.sale)
          : (this.text_container.textContent = "");
      }
    );
  }
}
customElements.define("product-label-element", ProductLabel);
class ProductLowStock extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.initial_availability = "true" === this.dataset.initialAvailability),
      (this.initial_quantity = parseInt(this.dataset.initialQuantity)),
      (this.message = this.querySelector(".product-low-stock--message")),
      (this.threshold = parseInt(this.dataset.threshold)),
      (this.translations = JSON.parse(
        this.querySelector('script[id*="low_stock_translations"]').textContent
      )),
      this.updateListener(),
      this.initial_availability
        ? this.update(this.initial_quantity)
        : this.show(!1);
  }
  updateListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged`,
      ({ detail: { variant: t } }) => {
        t.id && t.available ? this.update(t.inventory_quantity) : this.show(!1);
      }
    );
  }
  update(t) {
    let e;
    !t || t < 1 || t > this.threshold
      ? this.show(!1)
      : (1 === t
          ? (e = (e = this.translations.low_in_stock.one).replace("&#39;", "'"))
          : 1 < t &&
            (e = (e = this.translations.low_in_stock.other)
              .replace(/\d+/, t)
              .replace("&#39;", "'")),
        this.style.setProperty(
          "--progress-percent",
          `${(100 * t) / this.threshold}%`
        ),
        (this.message.textContent = e),
        this.show(!0));
  }
  show(t) {
    this.parentNode.setAttribute("aria-hidden", !t);
  }
}
customElements.define("product-low-stock-element", ProductLowStock);
class ProductMedia extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.first_variant_media_id = parseInt(
      this.getAttribute("data-first-variant-media")
    )),
      (this.layout = this.dataset.layout),
      (this.masonry_container = this.querySelector("[data-masonry-layout]")),
      (this.media = this.querySelectorAll(".product-media--root")),
      (this.playable_media = this.querySelectorAll(
        ".product-model--root, .product-video--root"
      )),
      (this.scroll_enabled =
        "true" === this.getAttribute("data-variant-scroll")),
      this.pauseListener(),
      this.updateMediaListeners(),
      this.masonry_container &&
        ((this.gap = parseInt(this.masonry_container.dataset.gap)),
        this.getMasonryBlocks(),
        this.initResizeObserver()),
      this.first_variant_media_id &&
        this.scroll_enabled &&
        setTimeout(
          () => this.updateVariantMedia(this.first_variant_media_id),
          0
        );
  }
  disconnectedCallback() {
    this.playable_media.off(`click.${this.dataset.id}`),
      window.off(
        `theme:product:${this.dataset.id}:variantChanged.ProductMedia theme:product:${this.dataset.id}:mediaChanged.ProductMedia`
      );
  }
  pauseListener() {
    this.playable_media.on(`click.${this.dataset.id}`, ({ target: t }) => {
      var e = t.closest(".product-model--root, .product-video--root");
      this.playable_media.not(e).forEach((t) => t.trigger("pauseMedia"));
    });
  }
  updateMediaListeners() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged.ProductMedia`,
      ({ detail: { variant: t } }) => {
        var e = t.featured_media ? parseInt(t.featured_media.id) : 0;
        this.updateVariantMedia(e);
      }
    ),
      window.on(
        `theme:product:${this.dataset.id}:mediaChanged.ProductMedia`,
        ({ detail: { id: t } }) => this.updateVariantMedia(t)
      );
  }
  updateVariantMedia(i) {
    0 !== i &&
      this.media.forEach((t) => {
        var e = parseInt(t.dataset.id) === i;
        t.setAttribute("data-active", e),
          t.children[0].trigger(e ? "playMedia" : "pauseMedia"),
          e &&
            ("one" == this.layout || "two" == this.layout
              ? this.scrollToMedia(parseInt(t.offset().top))
              : "mixed" == this.layout &&
                (this.updateMixedMedia(t),
                this.scrollToMedia(parseInt(this.offset().top))));
      });
  }
  scrollToMedia(t) {
    var e;
    window.location.search.includes("variant=") &&
      this.scroll_enabled &&
      "small" !== window.sizeQuery &&
      ((e = Utils.getStickyOffset()),
      window.scrollTo({ top: t - e - 8, left: 0, behavior: "smooth" }));
  }
  updateMixedMedia(t) {
    var e = this.querySelector(".product-media--active .product-media--root");
    e &&
      (this.swapMedia(t, e),
      (this.media = this.querySelectorAll(".product-media--root"))),
      this.masonry_container && this.getMasonryBlocks();
  }
  swapMedia(t, e) {
    t.replaceWith(e.cloneNode(!0)), e.replaceWith(t.cloneNode(!0));
  }
  getMasonryBlocks() {
    (this.left_blocks = this.masonry_container.querySelectorAll(
      ":scope > :nth-child(odd)"
    )),
      (this.right_blocks = this.masonry_container.querySelectorAll(
        ":scope > :nth-child(even)"
      )),
      this.setMasonryLayout();
  }
  setMasonryLayout() {
    var t = this.getColumnHeight(this.left_blocks),
      e = this.getColumnHeight(this.right_blocks),
      i =
        e < t
          ? t + this.gap * (this.left_blocks.length - 1)
          : e + this.gap * (this.right_blocks.length - 1);
    this.masonry_container.style.height = `${i + 1}px`;
  }
  getColumnHeight(t) {
    return Math.ceil(
      [...t].reduce((t, e) => t + e.getBoundingClientRect().height, 0)
    );
  }
  initResizeObserver() {
    new ResizeObserver(() => this.setMasonryLayout()).observe(
      this.masonry_container
    );
  }
}
customElements.define("product-media-variants", ProductMedia);
class ProductModel extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.view = this.getAttribute("data-view")),
      (this.json = JSON.parse(
        document.querySelector("[id*=model_json").textContent
      )),
      this.addLoadListener(),
      this.loadWhenVisible();
  }
  addLoadListener() {
    this.on("load", () => this.load(), { once: !0 });
  }
  loadWhenVisible() {
    (this.load_observer = new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        t && this.load();
      },
      { rootMargin: `${window.innerHeight}px 0px` }
    )),
      this.load_observer.observe(this);
  }
  load() {
    this.off("load"),
      this.load_observer.unobserve(this),
      this.createPlayPauseObserver(),
      window.Shopify.loadFeatures([
        {
          name: "shopify-xr",
          version: "1.0",
          onLoad: () => this.loadShopifyXr(),
        },
        {
          name: "model-viewer-ui",
          version: "1.0",
          onLoad: () => this.loadModel(),
        },
      ]);
  }
  createPlayPauseObserver() {
    new IntersectionObserver(([{ isIntersecting: t }]) => {
      this.model && (t ? this.model.play() : this.model.pause());
    }).observe(this);
  }
  addEventListeners() {
    Shopify.designMode && this.on("theme:section:load", () => this.loadModel());
  }
  loadModel() {
    this.model ||
      !Shopify.ModelViewerUI ||
      ("small" === window.sizeQuery && "desktop" === this.view) ||
      ("small" !== window.sizeQuery && "mobile" === this.view) ||
      ((this.model = new Shopify.ModelViewerUI(
        this.querySelector("model-viewer")
      )),
      this.addEventListeners(),
      window.trigger("theme:product:mediaLoaded"));
  }
  loadShopifyXr() {
    window.ShopifyXR
      ? this.models_added ||
        (window.ShopifyXR.addModels(this.json),
        window.ShopifyXR.setupXRElements(),
        (this.models_added = !0))
      : document.addEventListener("shopify_xr_initialized", () =>
          this.loadShopifyXr()
        );
  }
}
customElements.define("product-model-element", ProductModel);
class ProductOptions extends HTMLElement {
  static variant_caches = {};
  constructor() {
    super();
  }
  connectedCallback() {
    (this.current_product_url = this.getAttribute("data-product-url")),
      (this.handle = this.getAttribute("data-product-handle")),
      (this.inputs = this.querySelectorAll("input")),
      (this.is_quick_add = null !== this.closest(".product-quick-add--form")),
      (this.options = this.querySelectorAll(
        "label[data-option-value-id], li[data-option-value-id]"
      )),
      (this.section_root = this.closest("[data-section-id]")),
      (this.section_id = this.section_root.getAttribute("data-section-id")),
      (this.is_product_page =
        "true" === this.getAttribute("data-main-product")),
      this.setCurrentOptions(),
      this.initSizeChart(),
      this.optionChangeListener(),
      this.loadVariantObserver(),
      this.preventFormSubmitOnEnter(),
      Shopify.designMode && this.editorListeners();
  }
  initSizeChart() {
    var t = this.querySelector(
      ".product-options--option .product-size-chart--root"
    );
    t &&
      (t.parentNode.querySelector("label").appendChild(t),
      t.removeAttribute("style"));
  }
  optionChangeListener() {
    this.querySelectorAll('[data-item="disclosure"], [data-item="radio"]').on(
      "change.ProductOptions",
      async ({ target: t }) => {
        this.setAttribute("aria-busy", !0), this.setCurrentOptions();
        var e = this.generateCacheKey(this.current_options),
          i = t.getAttribute("data-product-url");
        let s;
        if (
          (ProductOptions.variant_caches[e]
            ? (s = await ProductOptions.variant_caches[e])
            : ((s = await this.fetchData(i, this.current_options)),
              (ProductOptions.variant_caches[e] = s)),
          "" !== i && i != this.current_product_url)
        ) {
          var r = s.querySelector("[data-section-id]"),
            a =
              (this.section_root.parentNode.replaceChild(r, this.section_root),
              r.getAttribute("data-handle"));
          Utils.updateRecentProducts(a),
            (ProductOptions.variant_caches = {}),
            this.is_quick_add ||
              (window.trigger("theme:transition:reload:viewport"),
              Shopify.PaymentButton?.init(),
              this.is_product_page && history.replaceState({ path: i }, "", i));
        } else {
          let t = s.querySelector(".product-options--root");
          !t &&
            Shopify.designMode &&
            ((s = await this.fetchData(i, this.current_options)),
            (t = s.querySelector(".product-options--root"))),
            (this.outerHTML = t.outerHTML);
          var o = JSON.parse(t.querySelector("[id*=variant-json]").textContent);
          this.updateVariant(o);
        }
      }
    );
  }
  loadVariantObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t && (this.loadVariantHtml(), e.disconnect());
      },
      { threshold: 0 }
    ).observe(this);
  }
  loadVariantHtml() {
    this.options.forEach((t) => {
      let e = {
        value_id: t.getAttribute("data-option-value-id"),
        name: t.getAttribute("data-option-name"),
      };
      var i = this.current_options.map((t) => (t.name === e.name ? e : t)),
        s = this.generateCacheKey(i),
        r = t.getAttribute("data-product-url");
      ProductOptions.variant_caches[s] ||
        (ProductOptions.variant_caches[s] = this.fetchData(r, i));
    });
  }
  setCurrentOptions() {
    var t = this.querySelectorAll(
      '[data-item="disclosure"], [data-item="radio"]:checked'
    );
    this.current_options = [...t].map((t) => ({
      value_id: t.getAttribute("data-option-value-id"),
      name: t.getAttribute("data-option-name"),
    }));
  }
  generateCacheKey(t) {
    return `${this.section_id}_${t.map((t) => t.value_id).join("-")}`;
  }
  async fetchData(t, e) {
    var i = "" === t ? this.current_product_url : t,
      s = e.map((t) => t.value_id).join(","),
      r = await fetch(`${i}?section_id=${this.section_id}&option_values=${s}`);
    return r.ok ? (await r.text()).parse() : null;
  }
  preventFormSubmitOnEnter() {
    this.inputs.length &&
      this.inputs.on("keydown", (t) => "Enter" === t.key && t.preventDefault());
  }
  updateVariant(t) {
    this.is_product_page && this.updateHistoryState(t),
      window.trigger(`theme:product:${this.dataset.id}:variantChanged`, {
        variant: t,
      });
  }
  updateHistoryState(t) {
    let e = location.pathname;
    t && t.id && (e += `?variant=${t.id}`),
      history.replaceState({ path: e }, "", e);
  }
  editorListeners() {
    var t = this.closest("[data-shopify-editor-block]");
    t &&
      t.on("theme:block:select", () => {
        (ProductOptions.variant_caches[this.section_id] = {}),
          (ProductOptions.variant_caches =
            ProductOptions.variant_caches[this.section_id]);
      });
  }
}
customElements.define("product-options-element", ProductOptions);
class ProductPickup extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.init = "true" === this.getAttribute("data-load-first-variant")),
      (this.product_title = this.getAttribute("data-title")),
      (this.pickup_drawer_container = document.querySelector(
        '.drawer--container[data-view="pickup"]'
      )),
      this.loadWhenVisible();
  }
  loadWhenVisible() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t && (this.initPickup(), this.updatePickupListener(), e.disconnect());
      },
      { rootMargin: `${window.innerHeight}px 0px` }
    ).observe(this);
  }
  initPickup() {
    this.init
      ? this.getPickupForm(this.dataset.firstVariantId)
      : this.parentNode.setAttribute("aria-hidden", !0);
  }
  updatePickupListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged`,
      ({ detail: { variant: t } }) => {
        t.available && "shopify" === t.inventory_management
          ? this.getPickupForm(t.id)
          : (t.id && "shopify" === t.inventory_management && t.available) ||
            this.removeOldForm();
      }
    );
  }
  async getPickupForm(t) {
    this.setAttribute("data-loading", !0);
    var e = await fetch(
      `${Shopify.routes.root}variants/${t}/?section_id=pickup`
    );
    if (!e.ok) throw new Error(e.statusText);
    var i,
      s = await e.text(),
      r = s.parse(".pickup--form--container");
    this.removeOldForm(),
      this.setAttribute("data-loading", !1),
      r &&
        (this.appendChild(r),
        this.parentNode.setAttribute("aria-hidden", !1),
        ((i = s.parse(".pickup--drawer--container")).querySelector(
          ".pickup--drawer--product-title"
        ).textContent = this.product_title),
        "true" === this.getAttribute("data-is-only-variant") &&
          (i.querySelector(".pickup--drawer--variant-title").style.display =
            "none"),
        this.pickup_drawer_container.appendChild(i),
        window.trigger("theme:drawer:loadTriggers"));
  }
  removeOldForm() {
    this.parentNode.setAttribute("aria-hidden", !0),
      (this.pickup_drawer_container.innerHTML = ""),
      (this.innerHTML = "");
  }
}
customElements.define("product-pickup-element", ProductPickup);
class ProductPrice extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.compare_price = this.querySelector(".product-price--compare")),
      (this.price = this.querySelector(".product-price--original")),
      (this.money_format = this.getAttribute("data-money-format")),
      (this.reference_unit = this.querySelector(
        ".product-price--reference-unit"
      )),
      (this.reference_value = this.querySelector(
        ".product-price--reference-value"
      )),
      (this.unit_price = this.querySelector(".product-price--unit-price")),
      (this.unit_price_container = this.querySelector(
        ".product-price--unit-container"
      )),
      this.updatePriceListener();
  }
  disconnectedCallback() {
    window.off(`theme:product:${this.dataset.id}:variantChanged.ProductPrice`);
  }
  updatePriceListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged.ProductPrice`,
      ({ detail: { variant: t } }) => {
        this.updatePrices(t);
      }
    );
  }
  updatePrices(t) {
    t.id
      ? (this.parentNode.setAttribute("aria-hidden", !1),
        (this.price.innerHTML = this.formatMoney(t.price)),
        t.compare_at_price > t.price
          ? ((this.compare_price.innerHTML = this.formatMoney(
              t.compare_at_price
            )),
            this.compare_price.setAttribute("aria-hidden", !1))
          : this.compare_price.setAttribute("aria-hidden", !0),
        t.unit_price_measurement
          ? ((this.unit_price.innerHTML = this.formatMoney(t.unit_price)),
            (this.reference_unit.innerHTML =
              t.unit_price_measurement.reference_unit),
            1 === t.unit_price_measurement.reference_value &&
            this.reference_value
              ? this.reference_value.setAttribute("aria-hidden", !0)
              : this.reference_value &&
                ((this.reference_value.innerHTML =
                  t.unit_price_measurement.reference_value),
                this.reference_value.setAttribute("aria-hidden", !1)),
            this.unit_price_container.setAttribute("aria-hidden", !1))
          : this.unit_price_container.setAttribute("aria-hidden", !0))
      : this.parentNode.setAttribute("aria-hidden", !0);
  }
  formatMoney(t) {
    var e = this.money_format.includes("no_decimals") ? 0 : 2,
      i = this.money_format.includes("comma") ? "de-DE" : "en-US",
      s = Intl.NumberFormat(i, {
        minimumFractionDigits: e,
        maximumFractionDigits: e,
      }).format(t / 100);
    return this.money_format.replace(/\{\{\s*(\w+)\s*\}\}/, s);
  }
}
customElements.define("product-price-element", ProductPrice);
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.container = this.querySelector("[data-products-container]")),
      (this.intent = this.dataset.intent),
      (this.max_products = this.getAttribute("data-max-products")),
      (this.product_id = this.getAttribute("data-product-id")),
      this.loadWhenVisible();
  }
  loadWhenVisible() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t && (this.load(), e.disconnect());
      },
      { rootMargin: `${3 * window.innerHeight}px 0px` }
    ).observe(this);
  }
  async load() {
    var t = await fetch(
      `${Shopify.routes.product_recommendations}?section_id=${this.intent}-products&limit=${this.max_products}&product_id=${this.product_id}&intent=${this.intent}`
    );
    if (!t.ok) throw new Error(t.statusText);
    var i = (await t.text()).parse().querySelectorAll("[data-product-item]");
    if (i.length) {
      let e = new DocumentFragment();
      i.forEach((t) => e.append(t)),
        requestAnimationFrame(() => {
          (this.container.innerHTML = ""),
            this.container.appendChild(e),
            this.setAttribute("aria-hidden", !1),
            window.trigger("theme:transition:reload:related-products");
        });
    } else this.setAttribute("aria-hidden", !0);
  }
}
customElements.define(
  "product-recommendations-element",
  ProductRecommendations
);
class ProductSKU extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.text_container = this.querySelector("span")),
      this.show("" !== this.text_container.textContent),
      this.updateListener();
  }
  disconnectedCallback() {
    window.off(`theme:product:${this.dataset.id}:variantChanged.ProductSku`);
  }
  updateListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged.ProductSku`,
      ({ detail: { variant: t } }) => {
        this.show("" !== t.sku), (this.text_container.textContent = t.sku);
      }
    );
  }
  show(t) {
    this.parentNode.style.display = t ? "block" : "none";
  }
}
customElements.define("product-sku-element", ProductSKU);
class ProductThumbs extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.section = this.closest("[data-section-id]")),
      (this.thumbs = this.querySelectorAll(".product-media--thumb")),
      (this.wrapper = this.querySelector(".product-media--thumbs-wrapper")),
      this.updateMediaListener(),
      this.clickListener(),
      this.addPreloadListener();
  }
  disconnectedCallback() {
    window.off(`theme:product:${this.dataset.id}:variantChanged.ProductThumbs`);
  }
  updateMediaListener() {
    window.on(
      `theme:product:${this.dataset.id}:variantChanged.ProductThumbs`,
      ({ detail: { variant: t } }) => {
        t.featured_media && this.updateActive(t.featured_media.id);
      }
    );
  }
  clickListener() {
    this.thumbs.on("keypress click", ({ target: t }) => {
      var e = parseInt(t.dataset.id);
      this.updateActive(e),
        window.trigger(`theme:product:${this.dataset.id}:mediaChanged`, {
          id: e,
        });
    });
  }
  addPreloadListener() {
    this.thumbs.on("mouseenter", ({ target: t }) => {
      var e = parseInt(t.dataset.id),
        i = this.section.querySelector(`[data-id="${e}"]`),
        s = i.querySelector("img"),
        r = i.querySelector(".product-video--root, .product-model--root");
      s && s.src
        ? Utils.linkLoader(s.src, "preload", void 0, "image")
        : r && r.trigger("load");
    });
  }
  updateActive(i) {
    this.thumbs.forEach((t) => {
      var e = parseInt(t.dataset.id);
      t.setAttribute("data-active", e === i), e === i && this.scrollIntoView(t);
    });
  }
  scrollIntoView(t) {
    var e = this.getBoundingClientRect(),
      i = t.getBoundingClientRect(),
      s = i.top - e.top;
    let r;
    (r =
      s < e.height / 2
        ? this.wrapper.scrollTop + s - (e.height - i.height) / 2
        : this.wrapper.scrollTop + s - e.height / 2 + i.height / 2),
      this.wrapper.scrollTo({ top: r, behavior: "smooth" });
  }
}
customElements.define("product-thumbs-element", ProductThumbs);
class ProductUnavailableForm extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.input = this.querySelector(".product-unavailable--input")),
      (this.form_id = this.getAttribute("data-form-id")),
      (this.product_id = this.getAttribute("data-product-id")),
      (this.submit = this.querySelector(".product-unavailable--submit")),
      (this.external_form = document.getElementById(this.form_id)),
      (this.external_input = this.external_form?.querySelector(
        ".product-unavailable-form--input"
      )),
      (this.form_value = this.external_form?.querySelector(
        ".product-unavailable-form--value"
      )),
      this.toggleSubmit(this.input.value),
      this.addSubmitListener(),
      this.addTypingListener(),
      this.addDisplayListener();
  }
  addSubmitListener() {
    this.submit.on("click", () => {
      (this.external_input.value = this.input.value),
        this.submit.setAttribute("disabled", !0),
        this.setAttribute("aria-busy", !0),
        this.external_form.submit();
    });
  }
  addTypingListener() {
    this.input.on("input", ({ target: t }) => {
      (this.external_input.value = t.value), this.toggleSubmit(t.value);
    });
  }
  toggleSubmit(t) {
    Utils.isValidEmail(t)
      ? this.submit.removeAttribute("disabled")
      : this.submit.setAttribute("disabled", !0);
  }
  addDisplayListener() {
    window.on(
      `theme:product:${this.product_id}:variantChanged`,
      ({ detail: { variant: t } }) => {
        this.setAttribute("aria-hidden", !t.id || t.available),
          t.id &&
            (this.form_value.value = `${this.form_value.value.split(":")[0]}: ${
              t.name
            }`);
      }
    );
  }
}
customElements.define("product-unavailable-element", ProductUnavailableForm);
class ProductVideo extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.api = this.getAttribute("data-api")),
      (this.loop_enabled = "true" === this.getAttribute("data-loop-enabled")),
      (this.view = this.getAttribute("data-view")),
      (this.video_container = this.querySelector(".product-video")),
      (this.video_id = this.getAttribute("data-video-id")),
      this.addLoadListener(),
      this.loadWhenVisible();
  }
  addLoadListener() {
    this.on("load", () => this.load(), { once: !0 });
  }
  loadWhenVisible() {
    (this.load_observer = new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        t && this.load();
      },
      { rootMargin: `${2 * window.innerHeight}px 0px` }
    )),
      this.load_observer.observe(this);
  }
  load() {
    switch (
      (this.off("load"),
      this.load_observer.unobserve(this),
      this.createPlayPauseObserver(),
      this.api)
    ) {
      case "youtube":
        (window.onYouTubeIframeAPIReady = () =>
          window.trigger("theme:youtube:apiReady")),
          this.addYoutubeListeners(),
          Utils.scriptLoader("youtube", Shopify.routes.youtube);
        break;
      case "vimeo":
        Utils.scriptLoader("vimeo", Shopify.routes.libraries.vimeo, () =>
          this.loadVimeo()
        );
        break;
      case "plyr":
        this.addPlyrListeners(),
          Utils.linkLoader(
            "/cdn/shopifycloud/plyr/v2.0/shopify-plyr.css",
            "stylesheet"
          ),
          Utils.scriptLoader("plyr", Shopify.routes.libraries.plyr, () =>
            this.loadPlyrVideo()
          );
    }
  }
  createPlayPauseObserver() {
    new IntersectionObserver(([{ isIntersecting: t }]) => {
      this.video &&
        (t
          ? "youtube" === this.api
            ? this.video.playVideo()
            : this.video.play()
          : "youtube" === this.api
          ? this.video.pauseVideo()
          : this.video.pause());
    }).observe(this);
  }
  loadPlyrVideo() {
    this.video ||
      this.skipVideo() ||
      !Shopify.Video ||
      ((this.video = new Shopify.Video(this.querySelector("video"), {
        autoplay: !0,
        hideControls: !0,
        muted: !0,
        loop: { active: this.loop_enabled },
        controls: [],
      })),
      window.trigger("theme:product:mediaLoaded"));
  }
  addPlyrListeners() {
    Shopify.designMode &&
      this.on("theme:section:load", () => this.loadPlyrVideo());
  }
  loadVimeo() {
    this.video ||
      this.skipVideo() ||
      !Vimeo.Player ||
      ((this.video = new Vimeo.Player(this.video_container, {
        id: this.video_id,
        autopause: 0,
        playsinline: 1,
        muted: 1,
        loop: this.loop_enabled ? 1 : 0,
        title: 0,
        controls: 0,
      })),
      this.video.ready().then(() => {
        this.addVimeoListeners(), window.trigger("theme:product:mediaLoaded");
      }),
      this.video.play());
  }
  addVimeoListeners() {
    Shopify.designMode && this.on("theme:section:load", () => this.loadVimeo());
  }
  loadYoutubeVideo() {
    this.video ||
      this.skipVideo() ||
      !YT.Player ||
      (this.video = new YT.Player(this.video_container, {
        videoId: this.video_id,
        playerVars: {
          enablejsapi: 1,
          host: "https://www.youtube.com",
          origin: location.origin,
          loop: this.loop_enabled ? 1 : 0,
          playlist: this.video_id,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: ({ target: t }) => {
            t.mute(),
              t.playVideo(),
              window.trigger("theme:product:mediaLoaded");
          },
        },
      }));
  }
  addYoutubeListeners() {
    window.on("theme:youtube:apiReady", () => this.loadYoutubeVideo()),
      Shopify.designMode &&
        this.on("theme:section:load", () => this.loadYoutubeVideo());
  }
  skipVideo() {
    return (
      ("small" === window.sizeQuery && "desktop" === this.view) ||
      ("small" !== window.sizeQuery && "mobile" === this.view)
    );
  }
}
customElements.define("product-video-element", ProductVideo);
class ProductZoom extends HTMLElement {
  constructor() {
    super(),
      (this.enlarged_image = this.querySelector(".product-zoom--enlarged")),
      (this.magnify = parseFloat(this.dataset.magnify));
  }
  connectedCallback() {
    this.updateGeometry(), this.initResizeObserver(), this.mouseListeners();
  }
  updateGeometry() {
    var { offsetHeight: t, offsetWidth: e } = this,
      i = e * this.magnify,
      s = t * this.magnify;
    this.enlarged_image.style.setProperty("--enlarged-width", `${i}px`),
      (this.x_ratio = (i - e) / e),
      (this.y_ratio = (s - t) / t);
  }
  initResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => this.updateGeometry());
    }).observe(this);
  }
  mouseListeners() {
    this.on("mouseenter", () =>
      this.enlarged_image.setAttribute("aria-hidden", "false")
    ),
      this.on("mouseleave", () =>
        this.enlarged_image.setAttribute("aria-hidden", "true")
      ),
      this.on("mousemove", ({ pageX: t, pageY: e }) => {
        requestAnimationFrame(() => this.moveEnlargedImage(t, e));
      });
  }
  moveEnlargedImage(t, e) {
    var { left: i, top: s } = this.offset(),
      r = (i - t) * this.x_ratio,
      a = (s - e) * this.y_ratio;
    this.enlarged_image.style.setProperty("--offset-x", `${r}px`),
      this.enlarged_image.style.setProperty("--offset-y", `${a}px`);
  }
}
customElements.define("product-zoom-element", ProductZoom);
class QuantitySelector extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.minus = this.querySelector(".quantity-selector--minus")),
      (this.plus = this.querySelector(".quantity-selector--plus")),
      (this.input = this.querySelector(".quantity-selector--input")),
      (this.remove = this.querySelector(".quantity-selector--remove")),
      this.inputListener(),
      this.plusListener(),
      this.minusListener(),
      (this.type = this.getAttribute("data-type")),
      "cart" === this.type
        ? ((this.cart = this.closest(".cart--root")),
          (this.line_num =
            this.closest(".cart--item").getAttribute("data-line-num")),
          this.removeListener())
        : "product" === this.type && this.updateValueListener();
  }
  inputListener() {
    let e;
    this.input.on("keydown", (t) => {
      var e = t.which;
      (e < 48 || 57 < e) &&
        (e < 37 || 40 < e) &&
        8 !== e &&
        9 !== e &&
        t.preventDefault();
    }),
      this.input.on(
        "focusin",
        async ({ target: t }) => (e = parseInt(t.value))
      ),
      this.input.on("focusout", async () => {
        var t = parseInt(this.input.value);
        isNaN(t) || t === e
          ? (this.input.value = e)
          : ((this.input.value = t), this.callback(t));
      });
  }
  plusListener() {
    this.plus.on("click keydown", (t) => {
      var e;
      ("keydown" === t.type && "Enter" !== t.key) ||
        (t.preventDefault(),
        (e =
          0 < parseInt(this.input.value) ? parseInt(this.input.value) + 1 : 1),
        (this.input.value = e),
        this.callback(e));
    });
  }
  minusListener() {
    this.minus.on("click keydown", (t) => {
      var e;
      ("keydown" === t.type && "Enter" !== t.key) ||
        (t.preventDefault(),
        1 !== parseInt(this.input.value) &&
          ((e =
            1 < parseInt(this.input.value) - 1
              ? parseInt(this.input.value) - 1
              : 1),
          (this.input.value = e),
          this.callback(e)));
    });
  }
  removeListener() {
    this.remove.on("click", () => this.callback(0));
  }
  updateValueListener() {
    window.on(
      `theme:product:${this.dataset.id}:updateQuantity`,
      ({ detail: t }) => {
        (this.input.value = t), this.input.trigger("focusout");
      }
    );
  }
  callback(t) {
    "cart" === this.type
      ? this.cart.tryToUpdateQuantity(this.line_num, t)
      : "product" === this.type &&
        window.trigger(`theme:product:${this.dataset.id}:quantityChanged`, t);
  }
}
customElements.define("quantity-selector", QuantitySelector);
class RecentProductsSection extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.grid_container = this.querySelector(".recent-products--grid")),
      (this.fragment = new DocumentFragment()),
      (this.section_id = this.getAttribute("data-section-id")),
      (this.spinner = this.querySelector(".recent-products--spinner")),
      (this.storage = JSON.parse(
        localStorage.getItem(`${Shopify.theme.name}:recent_products`)
      )),
      this.loadWhenVisible();
  }
  loadWhenVisible() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t &&
          (this.storage
            ? this.load()
            : this.setAttribute("aria-hidden", "true"),
          e.disconnect());
      },
      { rootMargin: `${window.innerHeight}px 0px` }
    ).observe(this);
  }
  load() {
    var t = this.storage.map((t) => this.renderProductItem(t));
    Promise.allSettled(t).then(() => this.productsLoadedCallback());
  }
  async renderProductItem(t) {
    var e,
      i = await fetch(`${Shopify.routes.root}products/${t}?view=ajax-item`);
    i.ok &&
      ((e = (await i.text()).parse(".product-card--root"))?.setAttribute(
        "data-transition-item",
        this.section_id
      ),
      this.fragment.prepend(e));
  }
  productsLoadedCallback() {
    requestAnimationFrame(() => {
      this.grid_container.prepend(this.fragment),
        window.trigger(`theme:transition:reload:${this.section_id}`),
        this.grid_container.setAttribute("aria-hidden", "false"),
        this.spinner.setAttribute("aria-hidden", "true");
    });
  }
}
customElements.define("recent-products-element", RecentProductsSection);
class RotatingText extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.current_index = 0),
      (this.items = this.querySelectorAll(".rotating-item")),
      1 < this.items.length && this.addIntersectionObserver();
  }
  disconnectedCallback() {
    this.resetInterval();
  }
  addIntersectionObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        this.resetInterval(), t && this.startInterval();
      },
      { rootMargin: `${window.innerHeight / 2}px 0px` }
    ).observe(this);
  }
  startInterval() {
    this.interval = setInterval(() => this.updateActiveItem(), 3e3);
  }
  resetInterval() {
    this.interval &&
      (this.items[this.current_index].trigger("transitionend"),
      clearInterval(this.interval));
  }
  updateActiveItem() {
    var t = (this.current_index + 1) % this.items.length;
    let e = this.current_index;
    this.items[this.current_index].on(
      "transitionend",
      () => this.items[e]?.setAttribute("data-state", "next"),
      { once: !0 }
    ),
      this.items[t]?.setAttribute("data-state", "current"),
      this.items[this.current_index]?.setAttribute("data-state", "previous"),
      (this.current_index = t);
  }
}
customElements.define("rotating-text", RotatingText);
class ScrollProgress extends HTMLElement {
  static instance_count = 0;
  constructor() {
    super(),
      (this.index = ScrollProgress.instance_count++),
      (this.scroll_event = `scroll.Parallax-${this.index}`),
      (this.width = null);
  }
  connectedCallback() {
    (this.progress_type =
      this.getAttribute("data-progress-type") || "parallax"),
      (this.progress_el =
        this.querySelector(this.getAttribute("data-progress-el")) ||
        this.querySelector(":scope > *")),
      "parallax" === this.progress_type &&
        (this.scale = parseFloat(
          getComputedStyle(this.progress_el).getPropertyValue(
            "--progress-scale"
          )
        )),
      this.addResizeObserver();
  }
  disconnectedCallback() {
    this.enable_observer?.disconnect(),
      this.resize_observer?.disconnect(),
      window.off(this.scroll_event);
  }
  addResizeObserver() {
    (this.resize_observer = new ResizeObserver(() => {
      requestAnimationFrame(() => this.updateDimensions());
    })),
      this.resize_observer.observe(this.progress_el);
  }
  updateDimensions() {
    var t = this.progress_el.offsetWidth;
    (null !== this.width && t === this.width) ||
      ((this.height = this.progress_el.offsetHeight),
      (this.width = t),
      (this.viewport_height = window.innerHeight),
      this.updateProgress(),
      this.enable_observer?.disconnect(),
      this.addEnableObserver());
  }
  addEnableObserver() {
    (this.enable_observer = new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        t
          ? window.on(this.scroll_event, () => this.updateProgress(), {
              passive: !0,
            })
          : window.off(this.scroll_event);
      }
    )),
      this.enable_observer.observe(this.progress_el);
  }
  updateProgress() {
    requestAnimationFrame(() => {
      var t = this.calculateProgress();
      ("parallax" === this.progress_type
        ? this.progress_el
        : this
      ).style.setProperty("--progress", t.toFixed(3));
    });
  }
  calculateProgress() {
    var t,
      e,
      i,
      s = this.progress_el.getBoundingClientRect().top;
    return "linear" === this.progress_type
      ? ((t = (this.viewport_height - s) / (this.viewport_height * (2 / 3))),
        Math.max(0, Math.min(1, t)))
      : "parallax" === this.progress_type
      ? ((e = this.viewport_height + this.height),
        (i = (this.viewport_height - s) / e),
        (i = Math.max(0, Math.min(1, i))),
        1 - (this.scale - 1) / 2 + i * (this.scale - 1))
      : void 0;
  }
}
customElements.define("scroll-progress", ScrollProgress);
class ScrollingContent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    new IntersectionObserver(
      ([{ isIntersecting: t }]) =>
        this.style.setProperty("--animation-state", t ? "running" : "paused"),
      { threshold: 0.1 }
    ).observe(this);
  }
}
customElements.define("scrolling-content", ScrollingContent);
class ServiceListSection extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.block_list = this.querySelectorAll(".service-list--blocks")),
      (this.blocks = this.querySelectorAll("li")),
      (this.blocks_container = this.querySelector(".service-list--container")),
      (this.headers = this.querySelectorAll(".service-list--block-header")),
      (this.single_column = this.querySelector(".service-list--single-column")),
      (this.left_column = this.querySelector(".service-list--left-column")),
      (this.right_column = this.querySelector(".service-list--right-column")),
      (this.with_multiple_headers = 1 < this.block_list.length),
      this.balanceColumns();
  }
  balanceColumns() {
    let s = this.assignLoopList();
    s.forEach((e, t) => {
      if (this.thresholdBreached()) {
        let e = new DocumentFragment();
        this.single_column
          .querySelectorAll(".service-list--blocks")
          .forEach((t) => e.append(t)),
          void this.right_column.appendChild(e);
      } else {
        var i;
        this.with_multiple_headers
          ? this.left_column.appendChild(e)
          : e.classList.contains("service-list--block-header")
          ? (this.blocks_container.prepend(
              e.querySelector(".service-list--block-header--text")
            ),
            e.remove())
          : this.left_column
              .querySelectorAll(".service-list--blocks")
              .forEach((t) => t.appendChild(e)),
          t === s.length - 1 &&
            "" === this.right_column.innerHTML &&
            1 < this.headers.length &&
            ((i = this.left_column.querySelectorAll(".service-list--blocks")),
            this.right_column.appendChild(i[i.length - 1]));
      }
    });
  }
  assignLoopList() {
    var t;
    return this.with_multiple_headers
      ? this.block_list
      : ((t = '<ul class="service-list--blocks"></ul>'.parse()),
        this.left_column.appendChild(t),
        this.blocks);
  }
  thresholdBreached() {
    var t = this.single_column.offsetHeight,
      e = this.left_column.offsetHeight,
      i = this.right_column.offsetHeight;
    return e >= parseFloat(i + t);
  }
}
customElements.define("service-list-element", ServiceListSection);
class ShareUrl extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var t = document.querySelector('meta[name="description"]'),
      e = t ? t.getAttribute("content") : null;
    (this.share_data = {
      title: document.title,
      text: e,
      url: window.location.href,
    }),
      this.clickListener(),
      navigator.share &&
        navigator.canShare(this.share_data) &&
        this.querySelectorAll("[aria-hidden]").forEach((t) => {
          var e = "true" !== t.getAttribute("aria-hidden");
          t.setAttribute("aria-hidden", e);
        });
  }
  clickListener() {
    this.on("click", (t) => {
      navigator.share && navigator.canShare(this.share_data)
        ? navigator.share(this.share_data)
        : (t.preventDefault(), FeedbackBar.trigger("copy"));
    });
  }
}
customElements.define("share-url", ShareUrl);
class ShopTheBannerSection extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.blocks = this.querySelectorAll(".shop-the-banner--block")),
      (this.buttons = this.querySelectorAll(".shop-the-banner--button")),
      (this.hide_timer = null),
      (this.prev_button = null),
      (this.products = this.querySelectorAll(".shop-the-banner--product")),
      (this.section_id = this.getAttribute("data-section-id")),
      (this.selected_button = null),
      (this.width = null),
      this.addResizeObserver(),
      this.addTransitionObserver(),
      Shopify.designMode && this.addEditorMethods();
  }
  addResizeObserver() {
    new ResizeObserver(() => {
      this.width !== window.innerWidth &&
        requestAnimationFrame(() => {
          (this.width = window.innerWidth),
            (this.is_touch_device =
              window.matchMedia("(pointer: coarse)").matches),
            this.updateProductPositions(),
            this.addListeners();
        });
    }).observe(document.body);
  }
  updateProductPositions() {
    let h = "small" === window.sizeQuery;
    this.buttons.forEach((t) => {
      var e = t.nextElementSibling,
        i = getComputedStyle(t),
        s = parseInt(i.getPropertyValue(h ? "--mobile-x-pos" : "--x-pos")),
        r = parseInt(i.getPropertyValue(h ? "--mobile-y-pos" : "--y-pos")),
        a = e.offsetHeight,
        o = e.offsetWidth;
      let n = (o * s) / 100;
      s <= 5 ? (n = 0) : 95 <= s && (n = o),
        e.style.setProperty("--left-offset", `-${n}px`),
        50 < r
          ? e.style.setProperty("--top-offset", `-${a + 20}px`)
          : e.style.setProperty("--top-offset", "24px");
    });
  }
  addTransitionObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t &&
          ([...this.buttons].forEach((t) => {
            let e = t.querySelector('[data-item="hotspot"]');
            e?.style.setProperty(
              "--hotspot-animation",
              "var(--hotspot-default-animation)"
            ),
              setTimeout(
                () => e?.style.setProperty("--hotspot-size", "100%"),
                1500
              );
          }),
          e.disconnect());
      },
      { threshold: 0.4 }
    ).observe(this);
  }
  addListeners() {
    this.buttons.off("touchstart mouseenter"),
      this.blocks.off("mouseleave"),
      this.products.off("mouseenter"),
      this.is_touch_device
        ? this.buttons.on("touchstart", ({ target: t }) =>
            this.updateActiveProduct(t)
          )
        : (this.buttons.on("mouseenter", ({ target: t }) =>
            this.updateActiveProduct(t)
          ),
          this.blocks.on("mouseleave", ({ target: t }) => {
            let e = t.querySelector(".shop-the-banner--button");
            this.hide_timer = setTimeout(() => {
              this.hideProduct(e), this.resetTimer();
            }, 80);
          }),
          this.products.on("mouseenter", () => this.resetTimer()));
  }
  resetTimer() {
    this.hide_timer && clearTimeout(this.hide_timer), (this.hide_timer = null);
  }
  updateActiveProduct(t) {
    this.prev_button === t
      ? this.hideProduct(t)
      : (this.prev_button && this.hideProduct(this.prev_button),
        this.showProduct(t));
  }
  hideProduct(t) {
    t.nextElementSibling?.setAttribute("data-transition-active", !1),
      t.setAttribute("data-transition-active", !1),
      (this.prev_button = null),
      document.off(`touchstart.${this.section_id}`);
  }
  showProduct(t) {
    var e = t.nextElementSibling;
    t.setAttribute("data-transition-active", !0),
      e?.setAttribute("data-transition-active", !0),
      (this.prev_button = t),
      this.is_touch_device && this.addClickOutsideListener(t);
  }
  addClickOutsideListener(e) {
    document.on(`touchstart.${this.section_id}`, ({ target: t }) => {
      !e.parentNode.contains(t) &&
        Drawer.status.includes("clos") &&
        (this.hideProduct(e), document.off(`touchstart.${this.section_id}`));
    });
  }
  addEditorMethods() {
    this.buttons.forEach((t) => {
      (t.open = () => this.showProduct(t)),
        (t.close = () => this.hideProduct(t));
    });
  }
}
customElements.define("shop-the-banner", ShopTheBannerSection);
class ShopTheLookSection extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.active_index = 0),
      (this.add = this.querySelector(".shop-the-look--add")),
      (this.buttons = this.querySelectorAll(".shop-the-look--button")),
      (this.cart_type = this.getAttribute("data-cart-type")),
      (this.next = this.querySelector(".shop-the-look--next")),
      (this.prev = this.querySelector(".shop-the-look--prev")),
      (this.products = this.querySelectorAll(".shop-the-look--product")),
      (this.product_ids = this.getProductIds()),
      this.addTransitionObserver(),
      this.addToCartListener(),
      this.hotspotListener(),
      this.buttonListener(),
      new ResizeObserver(() => this.updateImageHeight()).observe(this),
      Shopify.designMode && this.blockListener();
  }
  getProductIds() {
    return [...this.products]
      .map((t) => parseInt(t.getAttribute("data-product-id")))
      .filter((t) => !isNaN(t));
  }
  addTransitionObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t &&
          ([...this.buttons].forEach((t) => {
            let e = t.querySelector('[data-item="hotspot"]');
            e?.style.setProperty(
              "--hotspot-animation",
              "var(--hotspot-default-animation)"
            ),
              setTimeout(
                () => e?.style.setProperty("--hotspot-size", "100%"),
                1500
              );
          }),
          this.updateActiveProduct(),
          e.disconnect());
      },
      { threshold: 0.5 }
    ).observe(this);
  }
  addToCartListener() {
    this.add?.on("click", async () => {
      if (0 !== this.product_ids.length) {
        this.add.setAttribute("aria-busy", !0);
        var t = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: this.product_ids.map((t) => ({ id: t, quantity: 1 })),
            sections: Cart.sections,
          }),
        };
        try {
          await Cart.addItems(t, "drawer" === this.cart_type ? this.add : null),
            "drawer" === this.cart_type
              ? this.add.setAttribute("aria-busy", !1)
              : (window.location = Shopify.routes.cart);
        } catch (t) {
          throw (this.add.setAttribute("aria-busy", !1), new Error(t));
        }
      }
    });
  }
  hotspotListener() {
    this.buttons.on("click", ({ key: t, target: e, type: i }) => {
      ("keydown" === i && "Enter" !== t) ||
        ((this.active_index = parseInt(e.dataset.index)),
        this.updateActiveProduct());
    });
  }
  buttonListener() {
    this.next.on("click", () => {
      (this.active_index =
        this.active_index === this.products.length - 1
          ? 0
          : this.active_index + 1),
        this.updateActiveProduct();
    }),
      this.prev.on("click", () => {
        (this.active_index =
          0 === this.active_index
            ? this.products.length - 1
            : this.active_index - 1),
          this.updateActiveProduct();
      });
  }
  updateActiveProduct() {
    this.products.forEach((t) => {
      t.setAttribute("data-transition-active", !1),
        t.setAttribute("aria-hidden", !0);
    }),
      this.buttons.forEach((t) => t.setAttribute("data-transition-active", !1)),
      this.buttons[this.active_index].setAttribute(
        "data-transition-active",
        !0
      ),
      this.products[this.active_index].setAttribute(
        "data-transition-active",
        !0
      ),
      this.products[this.active_index].setAttribute("aria-hidden", !1),
      this.updateImageHeight();
  }
  updateImageHeight() {
    var t = this.products[this.active_index].querySelector(
      ".product-card--image-wrapper"
    );
    t &&
      this.style.setProperty("--product-image-height", `${t.offsetHeight}px`);
  }
  blockListener() {
    this.buttons.on("theme:block:select", ({ target: t }) =>
      t.trigger("click")
    );
  }
}
customElements.define("shop-the-look-element", ShopTheLookSection);
class SlideshowCarousel extends Carousel {
  static block_selected = null;
  constructor() {
    super(), Shopify.designMode && this.shopifyListeners();
  }
  connectedCallback() {
    (this.auto_rotate = "true" === this.getAttribute("data-auto-rotate")),
      (this.dot_nav = this.querySelector(".carousel-nav-dot")),
      (this.dots = this.dot_nav?.querySelectorAll(".carousel-nav-dot--index")),
      (this.pause_button = this.querySelector(".carousel--pause")),
      (this.rotate_frequency =
        1e3 * parseInt(this.getAttribute("data-rotate-frequency"))),
      this.dot_nav &&
        (this.dot_state = {
          offset: 0,
          trailing_index: 0,
          leading_index: 0,
          operation: null,
          width: 0,
        }),
      this.auto_rotate &&
        (this.timer_state = {
          start_time: null,
          running_time: 0,
          remaining_time: 0,
          status: "stopped",
        }),
      super.connectedCallback();
  }
  disconnectedCallback() {
    this.auto_rotate && this.clearTimer();
  }
  initNewScreenSize() {
    super.initNewScreenSize(),
      this.dots &&
        ((this.dot_state.operation = "init"),
        this.getDotWidth(),
        this.dotNavListeners(),
        this.updateActiveDot()),
      this.auto_rotate && this.pause_button && this.addPauseButtonListener();
  }
  updateActive() {
    super.updateActive(),
      this.auto_rotate &&
        ((this.timer_state.start_time = Date.now()),
        (this.timer_state.remaining_time = this.rotate_frequency),
        (this.timer_state.running_time = 0),
        SlideshowCarousel.block_selected ||
          "paused" === this.timer_state.status ||
          this.startAutoRotate());
  }
  startAutoRotate() {
    this.clearTimer(),
      1 < this.active_slide_count &&
        (this.setTimerState("running"),
        (this.auto_slide_interval = setInterval(() => {
          this.slideAndUpdateTimer();
        }, this.rotate_frequency)));
  }
  pauseAutoRotate() {
    (this.auto_slide_interval || this.auto_slide_timeout) &&
      "running" === this.timer_state.status &&
      (this.setPauseButtonState(!0),
      this.setTimerState("paused"),
      (this.timer_state.running_time +=
        Date.now() - this.timer_state.start_time),
      (this.timer_state.remaining_time =
        this.rotate_frequency - this.timer_state.running_time),
      this.clearTimer());
  }
  resumeAutoRotate() {
    "paused" === this.timer_state.status &&
      1 < this.active_slide_count &&
      (this.setPauseButtonState(!1),
      this.setTimerState("running"),
      (this.timer_state.start_time = Date.now()),
      (this.auto_slide_timeout = setTimeout(() => {
        this.slideAndUpdateTimer(), this.startAutoRotate();
      }, Math.max(0, this.timer_state.remaining_time))));
  }
  goToActiveSlide(t = !1, e = "forwards") {
    "slide" === this.transition_type
      ? (t && this.container.setAttribute("data-transition-state", e),
        this.updateContainerDestination(),
        this.resetPreviousTransitions(),
        this.reloadNextTransitions())
      : "fade" === this.transition_type
      ? this.fadeSlides()
      : "wipe" === this.transition_type && this.wipeSlides();
  }
  updateThenGoToActiveSlide(t, e = !1) {
    (this.dot_state.operation = "init"),
      super.updateThenGoToActiveSlide(t, e),
      5 < this.dots.length && this.initDotIndices(),
      this.updateActiveDot();
  }
  slideToNext(t = !1, e = !1) {
    this.dots && (this.dot_state.operation = "iterate");
    var i = super.slideToNext(t, e);
    return this.updateActiveDot(), i;
  }
  slideToPrev() {
    this.dots && (this.dot_state.operation = "iterate");
    var t = super.slideToPrev();
    return this.updateActiveDot(), t;
  }
  fadeSlides() {
    this.old_active_blocks &&
      this.old_active_blocks.forEach((t) => {
        t.setAttribute("data-active", !1),
          t.setAttribute("data-mobile-active", !1);
      }),
      this.reloadNextTransitions(),
      setTimeout(() => {
        SlideshowCarousel.block_selected || this.resetPreviousTransitions(),
          this.active_blocks.forEach((t) => {
            t.setAttribute("data-active", !0),
              t.setAttribute("data-mobile-active", !0);
          });
      }, 400);
  }
  wipeSlides() {
    if (this.old_active_blocks) {
      let i = 0;
      this.old_active_blocks.forEach((e) => {
        e.on("transitionend", ({ target: t }) => {
          t === e &&
            (e.setAttribute("data-active", !1),
            e.setAttribute("data-mobile-active", !1),
            e.off("transitionend"),
            ++i === this.old_active_blocks.length) &&
            (this.removePreviousTransitions(), this.reloadNextTransitions());
        }),
          e.setAttribute("data-active", "pending"),
          e.setAttribute("data-mobile-active", "pending");
      });
    } else this.resetPreviousTransitions();
    this.active_blocks.forEach((t) => {
      t.setAttribute("data-active", !0),
        t.setAttribute("data-mobile-active", !0);
    });
  }
  reloadNextTransitions() {
    (this.old_active_blocks &&
      Utils.arraysEqual(this.old_active_blocks, this.active_blocks)) ||
      this.active_blocks?.forEach((t) => {
        window.trigger(`theme:transition:reload:${t.dataset.id}`);
      });
  }
  removePreviousTransitions() {
    (this.old_active_blocks &&
      Utils.arraysEqual(this.old_active_blocks, this.active_blocks)) ||
      this.old_active_blocks?.forEach((t) => {
        window.trigger(`theme:transition:remove:${t.dataset.id}`);
      });
  }
  blockSelectedCallback(t) {
    this.setAttribute("data-auto-rotate", !1),
      (this.auto_slide_interval || this.auto_slide_timeout) &&
        (this.clearTimer(),
        (this.timer_state.status = "stopped"),
        this.setPauseButtonState(!0, !0)),
      super.blockSelectedCallback(t);
  }
  blockDeselectedCallback() {
    super.blockDeselectedCallback(),
      this.setAttribute("data-auto-rotate", this.auto_rotate),
      this.auto_rotate &&
        (this.startAutoRotate(), this.setPauseButtonState(!1));
  }
  clearTimer() {
    this.auto_slide_interval &&
      (clearInterval(this.auto_slide_interval),
      (this.auto_slide_interval = null)),
      this.auto_slide_timeout &&
        (clearTimeout(this.auto_slide_timeout),
        (this.auto_slide_timeout = null));
  }
  setTimerState(t) {
    (this.timer_state.status = t),
      this.style.setProperty("--animation-play-state", t);
  }
  setPauseButtonState(t, e = !1) {
    this.pause_button &&
      (this.pause_button.setAttribute("aria-pressed", t),
      e
        ? this.pause_button.setAttribute("disabled", "disabled")
        : this.pause_button.removeAttribute("disabled"));
  }
  slideAndUpdateTimer() {
    this.slideToNext(!0),
      this.updateActiveDot(),
      this.setSliderHeight(),
      (this.timer_state.start_time = Date.now()),
      (this.timer_state.running_time = 0);
  }
  addPauseButtonListener() {
    this.pause_button.off(`click.${this.section_id}`),
      this.pause_button.on(`click.${this.section_id}`, ({ target: t }) => {
        "true" === t.getAttribute("aria-pressed")
          ? this.resumeAutoRotate()
          : this.pauseAutoRotate();
      });
  }
  getDotWidth() {
    var t = getComputedStyle(this.dot_nav),
      e = parseFloat(t.getPropertyValue("--dot-width")),
      i = parseFloat(t.getPropertyValue("--dot-gap"));
    this.dot_state.width = e + i || 20;
  }
  dotNavListeners() {
    this.dots?.length &&
      (this.dots.off(`click.${this.section_id}`),
      this.dots.on(`click.${this.section_id}`, ({ target: t }) => {
        this.active_slide !== t.index() + 1 &&
          this.updateThenGoToActiveSlide(t.index() + 1, !0);
      }),
      5 < this.dots.length) &&
      "small" === this.sizeQuery &&
      (this.dots.off("transitionend"),
      this.dots.on("transitionend", ({ target: t }) => {
        t.parentNode === this.dots[this.active_slide - 1] &&
          this.style.setProperty("--dot-pos", `${this.dot_state.offset}px`);
      }));
  }
  updateActiveDot() {
    this.dots?.length &&
      (this.dots &&
        this.dots.forEach((t) =>
          t.setAttribute("aria-current", t === this.dots[this.active_slide - 1])
        ),
      this.dots[this.active_slide - 1]) &&
      5 < this.dots.length &&
      this.updateTrailingLeadingDots();
  }
  updateTrailingLeadingDots() {
    var t,
      e,
      i = this.dots[this.active_slide - 1].getAttribute("data-position"),
      s = "" !== i;
    this.active_slide === this.dot_state.leading_index
      ? (this.dot_state.leading_index++,
        this.dot_state.trailing_index++,
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
        this.moveDots(s))
      : this.active_slide === this.dot_state.trailing_index
      ? (this.dot_state.leading_index--,
        this.dot_state.trailing_index--,
        this.dots.forEach((t) => t.setAttribute("data-position", "")),
        (e = [...this.dots].slice(
          this.active_slide - 1,
          this.active_slide + 2
        )),
        2 <= this.active_slide &&
          (this.dots[this.active_slide - 2].setAttribute(
            "data-position",
            "trailing-1"
          ),
          e.push(this.dots[this.active_slide - 2])),
        3 <= this.active_slide &&
          (this.dots[this.active_slide - 3].setAttribute(
            "data-position",
            "trailing-2"
          ),
          e.push(this.dots[this.active_slide - 3])),
        this.dots.length > this.active_slide + 2 &&
          (this.dots[this.active_slide + 2].setAttribute(
            "data-position",
            "leading-1"
          ),
          e.push(this.dots[this.active_slide + 2])),
        this.dots.length > this.active_slide + 3 &&
          (this.dots[this.active_slide + 3].setAttribute(
            "data-position",
            "leading-2"
          ),
          e.push(this.dots[this.active_slide + 3])),
        this.dots
          .not(e)
          .forEach((t) => t.setAttribute("data-position", "hidden")),
        this.moveDots(s))
      : "init" === this.dot_state.operation || "hidden" === i
      ? (this.initDotIndices(), this.updateTrailingLeadingDots())
      : this.moveDots(s);
  }
  initDotIndices() {
    this.dots?.forEach((t) => t.setAttribute("data-position", "")),
      this.active_slide_count - this.active_slide <= 2
        ? ((this.dot_state.leading_index = this.active_slide),
          (this.dot_state.trailing_index = this.active_slide - 3))
        : 2 < this.active_slide_count - this.active_slide &&
          ((this.dot_state.trailing_index = this.active_slide),
          (this.dot_state.leading_index = this.active_slide + 3));
  }
  moveDots(t) {
    this.dots?.length &&
      (this.active_slide <= 3
        ? (this.dot_state.offset = 0)
        : this.active_slide >= this.active_slide_count - 2
        ? (this.dot_state.offset =
            (5 - this.active_slide_count) * this.dot_state.width)
        : (this.dot_state.offset =
            (3 - this.active_slide) * this.dot_state.width),
      "small" !== this.loaded_size
        ? this.style.setProperty("--dot-pos", "0px")
        : t ||
          this.style.setProperty("--dot-pos", `${this.dot_state.offset}px`));
  }
  shopifyListeners() {
    this.on("theme:section:select", () => {
      SlideshowCarousel.block_selected && this.load();
    });
  }
}
customElements.define("slideshow-carousel", SlideshowCarousel);
class SubscribeForm extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.form = this.querySelector("form")),
      (this.input = this.querySelector(".subscribe-form--input")),
      (this.submit = this.querySelector("button")),
      this.clickListener();
  }
  clickListener() {
    this.submit.on("click", (t) => {
      t.preventDefault(),
        Utils.isValidEmail(this.input.value)
          ? this.submitForm()
          : FeedbackBar.load("email-invalid");
    });
  }
  submitForm() {
    this.form.submit(),
      this.form.setAttribute("aria-busy", !0),
      this.submit.setAttribute("disabled", "disabled");
  }
}
customElements.define("subscribe-form", SubscribeForm);
class VideoComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.api = this.getAttribute("data-api")),
      (this.autoplay = "true" === this.getAttribute("data-autoplay")),
      (this.display_type = this.getAttribute("data-display-type")),
      (this.play_button = this.querySelector(".video--play")),
      (this.id = this.getAttribute("data-id")),
      (this.video_id = this.getAttribute("data-video-id")),
      (this.video_wrapper = this.querySelector(".video--wrapper")),
      (this.width = null),
      this.loadWhenVisible(),
      "fill-available" === this.display_type && this.initResizeObserver();
  }
  loadWhenVisible() {
    new IntersectionObserver(
      ([{ isIntersecting: t }], e) => {
        t && (this.load(), e.disconnect());
      },
      { rootMargin: `${2 * window.innerHeight}px 0px` }
    ).observe(this);
  }
  load() {
    this.autoplay
      ? (this.loadLibraries(), this.pauseObserver())
      : (this.setThumbnail(), this.playButtonListeners());
  }
  initResizeObserver() {
    new ResizeObserver(() => {
      requestAnimationFrame(() => {
        var t;
        this.width !== this.offsetWidth &&
          ((this.width = this.offsetWidth),
          (t = (this.offsetWidth / this.offsetHeight).toFixed(4)),
          this.style.setProperty("--video-aspect-ratio", t),
          this.style.setProperty("--video-mobile-aspect-ratio", t));
      });
    }).observe(this.video_wrapper);
  }
  loadLibraries() {
    switch (this.api) {
      case "youtube":
        (window.onYouTubeIframeAPIReady = () =>
          window.trigger("theme:youtube:apiReady")),
          window.on("theme:youtube:apiReady", () => this.loadYoutube()),
          "loaded" === Utils.scripts.youtube
            ? this.loadYoutube()
            : Utils.scriptLoader("youtube", Shopify.routes.youtube);
        break;
      case "vimeo":
        Utils.scriptLoader("vimeo", Shopify.routes.libraries.vimeo, () =>
          this.loadVimeo()
        );
        break;
      case "plyr":
        Utils.linkLoader(
          "/cdn/shopifycloud/plyr/v2.0/shopify-plyr.css",
          "stylesheet"
        ),
          Utils.scriptLoader("plyr", Shopify.routes.libraries.plyr, () =>
            this.loadPlyr()
          );
    }
  }
  pauseObserver() {
    new IntersectionObserver(
      ([{ isIntersecting: t }]) => {
        this.player &&
          ("youtube" === this.api
            ? t
              ? this.player.playVideo && this.player.playVideo()
              : this.player.pauseVideo && this.player.pauseVideo()
            : t
            ? this.player.play && this.player.play()
            : this.player.pause && this.player.pause());
      },
      { threshold: 0.1 }
    ).observe(this);
  }

  loadPlyr() {
    this.player = this.video_wrapper.querySelector("video");

    // REMOVED: "|| this.autoplay" so the player initializes even when autoplay is true
    void 0 === Shopify.Video ||
      (this.player.on("ready", () => this.showPlayer()),
        new Shopify.Video(this.player, {
          autoplay: !0,
          hideControls: false,
          // CHANGED: Muted must be true for autoplay to work in most browsers
          muted: this.autoplay,
          loop: { active: !1 }, // You might want this.autoplay if you want it to loop
          // CHANGED: Define which controls appear during autoplay
          controls: this.autoplay
            ? ["mute"] // Show only mute controls for autoplay
            : [
              "play",
              "progress",
              "current-time",
              "mute",
              "volume",
              "captions",
              "settings",
              "pip",
              "airplay",
              "fullscreen",
            ],
        }));
  }

  loadVimeo() {
    void 0 !== Vimeo.Player &&
      ((this.player = new Vimeo.Player(`${this.id}-player`, {
        id: this.video_id,
        autopause: 0,
        playsinline: this.autoplay ? 1 : 0,
        muted: this.autoplay ? 1 : 0,
        background: this.autoplay ? 1 : 0,
        loop: this.autoplay ? 1 : 0,
        title: 0,
      })),
      this.player.ready().then(() => {
        this.showPlayer(),
          this.autoplay || this.vimeoEvents(),
          this.trigger("theme:video:loaded");
      }),
      Promise.all([
        this.player.getVideoWidth(),
        this.player.getVideoHeight(),
      ]).then(([t, e]) => this.setAspectRatio(e, t)),
      this.player.play());
  }
  vimeoEvents() {
    this.player.getDuration().then((t) => {
      this.player.addCuePoint(t - 0.3, {});
    }),
      this.player.on("cuepoint", () => {
        this.player.setCurrentTime(0), this.player.pause();
      });
  }
  loadYoutube() {
    var t, e;
    void 0 !== YT.Player &&
      ((this.player = new YT.Player(`${this.id}-player`, {
        videoId: this.video_id,
        playerVars: {
          enablejsapi: 1,
          host: "https://www.youtube.com",
          origin: location.origin,
          loop: this.autoplay ? 1 : 0,
          playlist: this.autoplay ? this.video_id : null,
        },
        events: {
          onReady: ({ target: t }) => this.youtubeReady(t),
          onStateChange: (t) => this.youtubeEvents(t),
        },
      })),
      ({ height: t, width: e } = this.player.getIframe()),
      this.setAspectRatio(t, e));
  }
  youtubeReady(t) {
    this.autoplay && t.mute(),
      this.showPlayer(),
      t.playVideo(),
      this.trigger("theme:video:loaded");
  }
  youtubeEvents({ target: t, data: e }) {
    this.autoplay ||
      e !== YT.PlayerState.ENDED ||
      (t.seekTo(0), t.pauseVideo());
  }
  showPlayer() {
    setTimeout(() => {
      this.autoplay || this.setAttribute("data-overlay-style", "none"),
        this.video_wrapper.setAttribute("data-transition-active", !0),
        this.trigger("theme:video:loaded");
    }, 50);
  }
  setAspectRatio(t, e) {
    this.style.setProperty("--natural-aspect-ratio", (e / t).toFixed(4));
  }
  async setThumbnail() {
    var t,
      e = this.querySelector(".video--thumbnail img");
    e && "" == e?.src && (t = await this.getAutoThumbnail()) && (e.src = t);
  }
  async getAutoThumbnail() {
    switch (this.api) {
      case "youtube":
        return `https://img.youtube.com/vi/${this.video_id}/maxresdefault.jpg`;
      case "vimeo":
        try {
          var t = (
            await (
              await fetch(
                `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${this.video_id}`
              )
            ).json()
          ).thumbnail_url;
          return t;
        } catch (t) {
          return console.error("Error fetching Vimeo thumbnail:", t), null;
        }
      case "plyr":
        var e = this.querySelector("video");
        return e && e.poster ? e.poster : null;
    }
  }
  playButtonListeners() {
    this.play_button &&
      this.play_button.on("click keydown", (t) => {
        ("keydown" === t.type && "Enter" !== t.key) ||
          (t.preventDefault(),
          this.loadLibraries(),
          setTimeout(() => this.setAttribute("data-loaded", !0), 500));
      });
  }
}
customElements.define("video-component", VideoComponent);
class XMenu extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.open_menu = null),
      (this.window_width = 0),
      (this.menu_links = this.querySelectorAll(
        ".x-menu--level-1--link > a:has(+ .x-menu--level-2--container)"
      )),
      (this.menu_containers = this.querySelectorAll(
        ".x-menu--level-1--link:has(> .x-menu--level-2--container)"
      )),
      (this.menus = this.querySelectorAll(".x-menu--level-2--container")),
      this.addMouseListeners(),
      this.addFocusListeners(),
      this.addTouchListeners(),
      new ResizeObserver(() => {
        requestAnimationFrame(() => {
          "small" != window.sizeQuery &&
            this.window_width !== window.innerWidth &&
            ((this.window_width = window.innerWidth), this.setNaturalHeights());
        });
      }).observe(document.body),
      Shopify.designMode && this.addEditorListeners();
  }
  addMouseListeners() {
    this.menu_links.on(
      "mouseenter.XMenu",
      ({ target: t }) => {
        this.close_timer ? (this.pending_open = t) : this.openMenu(t);
      },
      { passive: !0 }
    ),
      this.menu_links.on(
        "mouseleave.XMenu",
        ({ target: e, relatedTarget: i }) => {
          if (this.contains(i)) {
            if (!this.close_timer) {
              let t =
                !!i.closest('[data-megamenu="true"]') &&
                !!e.closest('[data-megamenu="true"]');
              this.close_timer = setTimeout(() => {
                this.pending_open
                  ? this.openMenu(this.pending_open, t)
                  : this.closeMenu(),
                  this.resetTimer();
              }, 80);
            }
          } else this.closeMenu(), this.resetTimer();
        },
        { passive: !0 }
      ),
      this.menus.on("mouseenter.XMenu", () => this.resetTimer(), {
        passive: !0,
      }),
      this.menus.on("mouseleave.XMenu", () => this.closeMenu(), {
        passive: !0,
      });
  }
  resetTimer() {
    this.close_timer && clearTimeout(this.close_timer),
      (this.close_timer = !1),
      (this.pending_open = !1);
  }
  addFocusListeners() {
    this.menu_links.on("focusin.XMenu", ({ target: t }) => this.openMenu(t)),
      this.menu_links.on(
        "focusout.XMenu",
        ({ target: t, relatedTarget: e }) => {
          t.parentNode.contains(e) || this.closeMenu();
        }
      ),
      this.menu_containers.on(
        "focusout.XMenu",
        ({ target: t, relatedTarget: e }) => {
          t.closest(".x-menu--level-1--link") ===
            e.closest(".x-menu--level-1--link") ||
            (e && e.closest(".x-menu--level-2--container")) ||
            this.closeMenu(!0);
        }
      );
  }
  addTouchListeners() {
    this.menu_links.on(
      "touchstart.XMenu",
      (t) => {
        t.preventDefault(),
          "true" === t.target.getAttribute("aria-expanded")
            ? this.closeMenu()
            : this.openMenu(t.target);
      },
      { passive: !0 }
    );
  }
  addEditorListeners() {
    this.on("shopify:block:deselect", () => this.closeMenu()),
      this.on("shopify:block:select", ({ target: t }) => {
        var e = t.closest(".x-menu--level-2--container");
        this.openMenu(e.previousElementSibling);
      });
  }
  setNaturalHeights() {
    this.menus.forEach((t) => {
      t.style.setProperty("--height", "auto"),
        t.setAttribute("aria-hidden", !1),
        t.style.setProperty("--natural-height", `${t.offsetHeight}px`),
        t.setAttribute("aria-hidden", !0);
    });
  }
  openMenu(t, e = !1) {
    var i,
      s = t.nextElementSibling;
    e
      ? ((i = getComputedStyle(this.open_menu).getPropertyValue(
          "--natural-height"
        )),
        s.style.setProperty("--height", i),
        this.closeMenu(!0))
      : this.open_menu && this.open_menu !== s
      ? (this.closeMenu(!0), s.style.setProperty("--height", "0px"))
      : this.open_menu && this.open_menu === s
      ? this.open_menu.off("transitionend")
      : s.style.setProperty("--height", "0px"),
      (this.open_menu = s),
      t.setAttribute("aria-expanded", !0),
      this.open_menu.setAttribute("aria-hidden", !1),
      requestAnimationFrame(() => {
        this.open_menu.style.setProperty("--height", "var(--natural-height)");
      });
  }
  closeMenu(t) {
    null !== this.open_menu &&
      (this.open_menu.previousElementSibling.setAttribute("aria-expanded", !1),
      this.open_menu.style.setProperty("--height", "0px"),
      t
        ? (this.findAndResetTransition(this.open_menu),
          this.open_menu.off("transitionend"),
          this.open_menu.setAttribute("aria-hidden", !0),
          (this.open_menu = null))
        : this.open_menu.on(
            "transitionend",
            () => {
              null !== this.open_menu &&
                (this.findAndResetTransition(this.open_menu),
                this.open_menu.setAttribute("aria-hidden", !0),
                (this.open_menu = null));
            },
            { once: !0 }
          ));
  }
  findAndResetTransition(t) {
    var e, i;
    t &&
      (e = t.hasAttribute("data-transition-container")
        ? t
        : t.querySelector("[data-transition-container]")) &&
      (i = e.getAttribute("data-transition-container")) &&
      window.trigger(`theme:transition:reset:${i}`);
  }
}
customElements.define("x-menu-element", XMenu);
class yMenu extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    (this.back_links = this.querySelectorAll(".y-menu--back-link button")),
      (this.sub_menu_links = this.querySelectorAll(
        'li > button[aria-haspopup="true"]'
      )),
      (this.regular_links = this.querySelectorAll("li > a").not(
        this.sub_menu_links
      )),
      (this.current_level = 0),
      (this.last_opened_id = "y-menu"),
      this.addButtonListeners(),
      this.addDrawerListeners(),
      Shopify.designMode && this.addEditorListeners();
  }
  disconnectedCallback() {
    [...this.regular_links, ...this.sub_menu_links, ...this.back_links].off(
      "click.YMenu"
    );
  }
  addButtonListeners() {
    this.regular_links.on("click.YMenu", ({ target: t }) => {
      let e = t.getAttribute("href");
      -1 !== e.indexOf("#") &&
        (Drawer.close(), setTimeout(() => (window.location.href = e), 450));
    }),
      this.sub_menu_links.on("click.YMenu", ({ target: t }) => {
        this.goToMenu(t, !0), t.setAttribute("aria-expanded", !0);
      }),
      this.back_links.on("click.YMenu", ({ target: t }) => {
        this.goToMenu(t, !1),
          t
            .closest("ul")
            ?.previousElementSibling.setAttribute("aria-expanded", !1);
      });
  }
  addDrawerListeners() {
    window.on(
      "theme:drawer:left:opening",
      () => this.style.setProperty("--height", `${this.offsetHeight + 1}px`),
      { once: !0 }
    ),
      window.on("theme:drawer:left:closed", () => {
        window.trigger(`theme:transition:reset:${this.last_opened_id}`);
      });
  }
  goToMenu(t, e) {
    let i = this.querySelector(`#${t.getAttribute("aria-controls")}`),
      s =
        (i?.setAttribute("aria-current", !0),
        (this.last_opened_id = i.id),
        this.querySelector(`#${t.closest("ul")?.id}`));
    s?.setAttribute("aria-current", !1),
      requestAnimationFrame(() => {
        (this.current_level += e ? 1 : -1),
          this.style.setProperty("--current-level", this.current_level),
          this.style.setProperty("--height", `${i.offsetHeight + 1}px`),
          window.trigger(`theme:transition:reset:${s?.id}`);
      });
  }
  addEditorListeners() {
    document
      .querySelector(".header--root")
      .on("shopify:block:select", ({ target: t }) => {
        var e = t.parentElement?.id?.replace("x-menu", "y-menu"),
          i = this.querySelector(`button[aria-controls="${e}"]`);
        this.goToMenu(i, !0);
      });
  }
}
customElements.define("y-menu-element", yMenu);
export { Utils, Drawer, Cart };
window.trigger("theme:loaded");
