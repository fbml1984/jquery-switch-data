function MaterialCheckbox(options) {
	'use strict';
	return this.init(options);
}

(function (window, document) {
	'use strict';
	
	MaterialCheckbox.prototype = {
		init: function (options) {
			var that = this;
			
			this.checkTouch();
			this.mergeOptions(options);
			
			var context = this.context !== null ? this.context : document,
				checkboxes = context.querySelectorAll('input[type="checkbox"]');
			
			if (checkboxes.length) {
				for (var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].style.display = 'none'
					wrapper(checkboxes[i], i);
				}
			}
			
			function wrapper(checkbox, id) {
				var _checkbox = checkbox.cloneNode(true),
					label = document.createElement('label'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
					polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'),
					event = new Event('change');
				
				label.classList.add('material-checkbox');
				label.htmlFor = 'cb' + id;
				svg.setAttributeNS(null, 'height', '18px');
				svg.setAttributeNS(null, 'height', '18px');
				svg.setAttributeNS(null, 'viewBox', '0 0 18 18');
				path.setAttributeNS(null, 'd', 'M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z');
				polyline.setAttributeNS(null, 'points', '1 9 7 14 15 4');
				
				svg.appendChild(path);
				svg.appendChild(polyline);
				
				_checkbox.id = 'cb' + id;
				label.appendChild(_checkbox);
				label.appendChild(svg);
				
				if (that.callbackFn !== null) {
					_checkbox.addEventListener('change', that.callbackFn);
				}
				
				checkbox.parentNode.replaceChild(label, checkbox);
				
				if (_checkbox.checked) {
					_checkbox.dispatchEvent(event);
				}
				
			}
			
		},
		checkTouch: function verifyTouch() {
			var html = document.querySelector('html'),
				isTouch = function () {
					var bool = false;
					if (window.ontouchstart !== undefined || (window.DocumentTouch && document instanceof DocumentTouch)) {
						bool = true;
					}
					return bool;
				},
				touch = 'touch',
				noTouch = 'no-touch';
			
			if (isTouch() && html.classList.contains(touch)) {
				html.classList.add(touch);
				
			} else if (!isTouch() && html.classList.contains(noTouch)) {
				html.classList.add(noTouch);
			}
		},
		mergeOptions: function (options) {
			var option,
				defaultOptions = {
					callbackFn: null,
					context: null
				};
			
			if (!options) {
				options = {};
			}
			
			for (option in defaultOptions) {
				if (defaultOptions.hasOwnProperty(option)) {
					this[option] = options[option] || defaultOptions[option];
				}
			}
		}
	};
}(window, document));