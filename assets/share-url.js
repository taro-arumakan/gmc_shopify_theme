class ShareUrl extends HTMLElement{constructor(){super()}connectedCallback(){var e=this.querySelectorAll("[aria-hidden]");this.clickListener(),navigator.share&&e.forEach(e=>{var t="true"!=e.getAttribute("aria-hidden");e.setAttribute("aria-hidden",t)})}clickListener(){this.on("click",e=>{var t,r;navigator.share?(r=(t=document.querySelector('meta[name="description"]'))?t.getAttribute("content"):null,navigator.share({title:document.title,text:r,url:window.location.href})):(e.preventDefault(),theme.feedback.trigger("copy"))})}}const shareUrlEl=customElements.get("share-url");shareUrlEl||customElements.define("share-url",ShareUrl);