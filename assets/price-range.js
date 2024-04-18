class PriceRange extends HTMLElement{constructor(){super()}connectedCallback(){this.active_price_tag=document.querySelector('.navigation--active-tag[data-type="price"]'),this.button_min_delta=32,this.container=this.closest(".filter--menu"),this.price_inputs=this.querySelectorAll(".price-range--input"),this.price_range_buttons=this.querySelectorAll(".price-range--button"),this.price_range_line=this.querySelector(".price-range--line"),this.price_range_transition=this.price_range_buttons[0].style.transition;var e,i,t=parseFloat(this.price_inputs[1].getAttribute("max").replace(",","."));0!==t&&(e=parseFloat(this.price_inputs[0].value.replace(",",".")),i=parseFloat(this.price_inputs[1].value.replace(",",".")),this.prices={current_min:e,pending_min:e,current_max:i,pending_max:i,max:t},this.priceRangeListeners(),this.priceRangeResizeObserver(),this.priceInputListeners(),this.renderActivePrice(),this.clearPriceListener())}priceRangeResizeObserver(){new ResizeObserver(()=>this.getPriceRangeGeometry()).observe(this.price_range_line)}priceInputListeners(){this.price_inputs.on("keydown",e=>{var i=e.which;(i<48||57<i)&&(i<37||40<i)&&8!==i&&9!==i&&13!==i&&65!==i&&67!==i&&86!==i&&88!==i&&91!==i&&188!==i&&190!==i&&e.preventDefault()}),this.price_inputs.on("change",e=>{var i=e.target,t=parseFloat(i.value);let r,s;i.dataset.hasOwnProperty("minPrice")?t+this.price_min_delta>this.prices.current_max?(t>this.prices.max-this.price_min_delta?(r=parseFloat((this.prices.max-this.price_min_delta).toFixed(2)),this.prices.current_max=this.prices.max):(r=t,this.prices.current_max=parseFloat((t+this.price_min_delta).toFixed(2))),i.value=r,this.prices.current_min=r,this.price_inputs[1].value=this.prices.current_max):this.prices.current_min=t:i.dataset.hasOwnProperty("maxPrice")&&(t>this.prices.max?(i.value=this.prices.max,this.prices.current_max=this.prices.max):this.prices.current_min+this.price_min_delta>t?(t-this.price_min_delta<0?(s=this.price_min_delta.toFixed(2),this.prices.current_min=0):(s=t,this.prices.current_min=parseFloat((t-this.price_min_delta).toFixed(2))),i.value=s,this.prices.current_max=s,this.price_inputs[0].value=this.prices.current_min):this.prices.current_max=t),this.getPriceRangePositions(),this.movePriceRangeButtons(),this.setPriceRangeFill(),this.renderActivePrice(),window.trigger("theme:navigation:loadNewProducts")})}getPriceRangeGeometry(){this.price_range_width=this.price_range_line.offsetWidth,this.price_range_width&&(this.pixels_per_price=this.price_range_width/this.prices.max,this.price_per_pixels=this.prices.max/this.price_range_width,this.price_min_delta=this.button_min_delta*(1/this.pixels_per_price),this.getPriceRangePositions(),this.movePriceRangeButtons(),this.setPriceRangeFill())}getPriceRangePositions(){this.price_positions={min:this.prices.current_min*this.pixels_per_price,max:this.prices.current_max*this.pixels_per_price}}movePriceRangeButtons(){this.price_range_buttons.forEach(e=>{e.style.transform=e.dataset.hasOwnProperty("maxPrice")?`translateX(-${this.price_range_width-this.price_positions.max}px)`:`translateX(${this.price_positions.min}px)`})}setPriceRangeFill(){var e=this.price_range_line.firstElementChild,i=this.price_range_width-this.price_positions.max;e.setStyles({margin:`0 ${i}px 0 ${this.price_positions.min}px`,width:`calc(100% - ${i+this.price_positions.min}px)`})}priceRangeListeners(){this.price_range_buttons.on("mousedown.priceRange touchstart.priceRange",e=>{this.active_range_button=e.target,theme.utils.disable_swipe_listener=!0,this.drag_start=("touchstart"===e.type?e.targetTouches[0]:e).pageX},{passive:!0}),window.on("mousemove.priceRange touchmove.priceRange",e=>{this.drag_start&&(this.animation_request&&cancelAnimationFrame(this.animation_request),this.animation_request=requestAnimationFrame(()=>this.getNewButtonPosition(e)))},{passive:!0}),window.on("mouseup.priceRange touchend.priceRange",()=>{this.drag_start&&(this.drag_start=!1,theme.utils.disable_swipe_listener=!1,this.active_range_button.dataset.hasOwnProperty("maxPrice")?(this.prices.current_max=parseFloat(this.prices.pending_max),this.price_inputs[1].value=this.prices.current_max):(this.prices.current_min=parseFloat(this.prices.pending_min),this.price_inputs[0].value=this.prices.current_min),this.getPriceRangePositions(),this.renderActivePrice(),window.trigger("theme:navigation:loadNewProducts"))},{passive:!0})}getNewButtonPosition(e){var i=e.type.includes("touch")?e.targetTouches[0].pageX-this.drag_start:e.pageX-this.drag_start;if(this.active_range_button.dataset.hasOwnProperty("maxPrice")){let e=this.prices.current_max*this.pixels_per_price+i;e>this.price_range_width?e=this.price_range_width:this.price_positions.min>e-this.button_min_delta&&(e=this.price_positions.min+this.button_min_delta),this.price_positions.max=e,this.prices.pending_max=(e*this.price_per_pixels).toFixed(2),this.price_inputs[1].value=this.prices.pending_max}else{let e=this.prices.current_min*this.pixels_per_price+i;e<0?e=0:e>this.price_positions.max-this.button_min_delta&&(e=this.price_positions.max-this.button_min_delta),this.price_positions.min=e,this.prices.pending_min=(e*this.price_per_pixels).toFixed(2),this.price_inputs[0].value=this.prices.pending_min}this.movePriceRangeButtons(),this.setPriceRangeFill()}renderActivePrice(){window.trigger("theme:priceRange:renderActive",this.prices)}clearPrices(){let t=!1;this.price_inputs.forEach(e=>{var i=parseFloat(e.value);e.dataset.hasOwnProperty("minPrice")&&0!==i?(e.value=0,t=!0):e.dataset.hasOwnProperty("maxPrice")&&i!==this.prices.max&&(e.value=this.prices.max,t=!0)}),t&&this.price_inputs.forEach(e=>e.trigger("change"))}clearPriceListener(){window.on("theme:priceRange:clear",()=>this.clearPrices())}}customElements.define("price-range-root",PriceRange);