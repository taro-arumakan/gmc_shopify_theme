class ProductZoom extends HTMLElement{constructor(){super(),this.enlarged_image=this.querySelector(".product-zoom--enlarged"),this.magnify=parseFloat(this.dataset.magnify)}connectedCallback(){this.updateGeometry(),this.resizeObserver(),this.mouseListeners()}updateGeometry(){var{offsetHeight:e,offsetWidth:t}=this,s=t*this.magnify,o=e*this.magnify;this.enlarged_image.style.width=s+"px",this.x_ratio=(s-t)/t,this.y_ratio=(o-e)/e}resizeObserver(){new ResizeObserver(()=>{this.updateGeometry()}).observe(this)}mouseListeners(){this.on("mouseenter",()=>this.enlarged_image.style.display="block"),this.on("mouseleave",()=>this.enlarged_image.style.display="none"),this.on("mousemove",({pageX:e,pageY:t})=>{this.mousemove_request&&cancelAnimationFrame(this.mousemove_request),this.mousemove_request=requestAnimationFrame(()=>this.moveEnlargedImage(e,t))})}moveEnlargedImage(e,t){var{left:s,top:o}=this.offset();this.enlarged_image.setStyles({left:(s-e)*this.x_ratio+"px",top:(o-t)*this.y_ratio+"px"})}}const productZoomEl=customElements.get("product-zoom-root");productZoomEl||customElements.define("product-zoom-root",ProductZoom);