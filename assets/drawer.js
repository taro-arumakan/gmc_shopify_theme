class Drawer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    ((theme.drawer = this).close_button =
      document.querySelector(".layout--close")),
      (this.focus_start = this.querySelector(".drawer--focus-start")),
      (this.focus_triggers = this.querySelectorAll(".drawer--focus-trigger")),
      (this.main_content = this.previousElementSibling),
      (this.instances = this.querySelectorAll(".drawer--instance")),
      (this.overlay = this.querySelector(".drawer--overlay")),
      (this.viewport = this.parentElement),
      (this.status = "closed"),
      (this.state = {}),
      this.load();
  }
  load() {
    this.viewportObserver(), this.loadTriggers(), this.touchListener();
  }
  viewportObserver() {
    window.on("resize", () => this.setViewport());
  }
  setViewport() {
    this.viewport.style.minHeight = window.innerHeight + "px";
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
        "Escape" === t.key && "closed" !== this.status && this.close();
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
        var e, s;
        ("keydown" === t.type && "Enter" !== t.key) ||
          ((e = t.target.getAttribute("data-drawer-open")),
            (s = t.target.getAttribute("data-drawer-view")),
            this.open(e, s, t.target),
            t.preventDefault(),
            t.stopPropagation());
      });
  }
  toggle(t) {
    (this.status = t),
      this.viewport.setAttribute("data-drawer-status", t),
      "opening" === t
        ? this.opening()
        : "closing" === t
          ? this.closing()
          : "opened" === t
            ? this.opened()
            : "closed" === t && this.closed(),
      window.trigger(`theme:drawer:${this.state.side}:` + t);
  }
  open(e, t, s) {
    this.setViewport(),
      this.status.includes("open") && e != this.state.side
        ? ((this.pending_open = [e, t, s]), this.close())
        : ((this.pending_open = null),
          (this.state = {
            instance: [...this.instances].find((t) => t.dataset.side === e),
            side: e,
            trigger: s,
            view: t,
          }),
          this.viewport.setAttribute("data-drawer-view", t),
          this.viewport.setAttribute("data-drawer-side", e),
          "opened" != this.status && this.toggle("opening"));
  }
  opening() {
    this.overlay.setAttribute("aria-hidden", !1),
      (this.window_offset = window.scrollY),
      this.main_content.setStyles({
        top: 0 === this.window_offset ? "0px" : `-${this.window_offset}px`,
        position: "fixed",
      }),
      this.state.instance.setAttribute("aria-expanded", !0),
      window.scrollTo(0, 0),
      "top" !== this.state.side && this.toggleCloseButton(!0),
      this.state.instance.on("transitionend", () => this.toggle("opened"), {
        once: !0,
      });
    fetch('/?sections=cart-drawer')
      .then(data => data.json())
      .then(res => document.querySelector('cart-root').innerHTML = res['cart-drawer']);
  }
  opened() {
    var t = document.getElementById(
      this.state.instance.getAttribute("data-focus-id")
    );
    (t || this.focus_start).focus();
  }
  close() {
    this.status.includes("clos") || this.toggle("closing");
  }
  closing() {
    this.overlay.setAttribute("aria-hidden", !0),
      "top" !== this.state.side && this.toggleCloseButton(!1),
      this.state.instance.setAttribute("aria-expanded", !1),
      this.state.instance.on("transitionend", () => this.toggle("closed"), {
        once: !0,
      }),
      this.state.trigger && this.state.trigger.focus(),
      theme.transitions.reset(this.state.view);
  }
  closed() {
    this.viewport.removeAttribute("data-drawer-view"),
      this.viewport.removeAttribute("data-drawer-side"),
      this.main_content.removeAttribute("style"),
      window.scrollTo(0, this.window_offset),
      this.pending_open && this.open(...this.pending_open);
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
    theme.utils.isTouchDevice &&
      (window.on("theme:swipe:left", () => {
        "left" === this.state.side && "opened" == this.status && this.close();
      }),
        window.on("theme:swipe:right", () => {
          "right" === this.state.side && "opened" == this.status && this.close();
        }));
  }
}
customElements.define("drawer-root", Drawer);
