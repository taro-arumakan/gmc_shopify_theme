class ConsentTracking extends HTMLElement{constructor(){super()}connectedCallback(){this.accept=this.querySelector(".popup--block--accept"),this.decline=this.querySelector(".popup--block--decline"),this.limit="true"===this.parentNode.getAttribute("data-limit"),this.eventListeners(),window.Shopify&&window.Shopify.loadFeatures([{name:"consent-tracking-api",version:"0.1",onLoad:()=>{window.Shopify.customerPrivacy&&window.Shopify.customerPrivacy.shouldShowBanner()?this.open():theme.popup&&theme.popup.loadNext()}}])}eventListeners(){[this.accept,this.decline].on("click",({target:t})=>{window.Shopify.customerPrivacy.setTrackingConsent({analytics:t===this.accept,marketing:t===this.accept,preferences:t===this.accept},()=>{this.close(),!this.limit&&theme.popup&&theme.popup.loadNext()})}),Shopify.designMode&&(this.on("theme:block:deselect",()=>this.close()),this.on("theme:block:select",()=>{this.off("transitionend"),this.open()}))}open(){this.setAttribute("aria-hidden",!1),setTimeout(()=>this.setAttribute("data-transition-active",!0),5)}close(){this.setAttribute("data-transition-active",!1),this.on("transitionend",()=>this.setAttribute("aria-hidden",!0),{once:!0})}}const consentTrackingEl=customElements.get("consent-tracking");consentTrackingEl||customElements.define("consent-tracking",ConsentTracking);