/*
 * @license
 *
 * Switch Data v0.0.1
 * https://github.com/fbml1984/jquery-humble-uploader.js
 *
 * Copyright (c) 2018-2018 Fábio Lazaro
 * Licensed under the MIT license (https://github.com/fbml1984/jquery-switch-data/blob/master/LICENSE)
 */


function HumbleUploader(options) {
	'use strict';
	return this.init(options);
}

(function (window, document) {
	'use strict';
	
	var EMPTY = '',
		HUMBLE_SINGLE = 'humble-single',
		HUMBLE_DROPZONE = 'humble-dropzone',
		HUMBLE_MULTIFILES = 'humble-multifiles';
	
	HumbleUploader.prototype = {
		type: null,
		element: null,
		container: null,
		reader: null,
		files: null,
		includedFiles: [],
		invalidFiles: [],
		init: function init(options) {
			this.checkTouch();
			this.mergeOptions(options);
			this.element = document.querySelector('[name="' + this.el + '"]');
			if (this.element !== null) {
				this.initialize();
			} else {
				alert('Error retrieving an element with the given name: ' + this.el);
			}
		},
		mergeOptions: function (options) {
			var option,
				defaultOptions = {
					el: null,
					placeholder: 'Click here to upload your files',
					thumbnailGridSize: 4,
					thumbnail: {
						width: 100,
						height: 100,
						margin: 10,
						border: 2,
						borderColor: 'black'
					},
					supportedFormats: '*',
					imageDefault: this.getRootUrl() + '/img/default.png',
					preview: null
				};
			
			if (!options) {
				options = {};
			}
			
			for (option in defaultOptions) {
				if (defaultOptions.hasOwnProperty(option)) {
					this[option] = options[option] || defaultOptions[option];
				}
			}
		},
		getRootUrl: function () {
			return window.location.origin ? window.location.origin + '/' : window.location.protocol + '/' + window.location.host + '/';
		},
		initialize: function () {
			var self = this,
				label = document.createElement('label'),
				labelText = document.createElement('span'), mobile = window.matchMedia('(max-width: 576px)'),
				tablet = window.matchMedia('(min-width: 576px) and (max-width: 768px)');
			
			if (mobile.matches) {
				if (this.thumbnailGridSize > 2) {
					this.thumbnailGridSize = 2;
				}
			}
			
			if (tablet.matches) {
				if (this.thumbnailGridSize > 4) {
					this.thumbnailGridSize = 4;
				}
			}
			console.log(this.element);
			if (this.element.classList.contains('humble-single')) {
				this.type = HUMBLE_SINGLE;
				this.element.id = this.element.name;
				
				this.element.addEventListener('change', function (e) {
					self.changeImagePreview(thumbnailImage, e);
				});
				
				var fileGroup = document.createElement('div'),
					fileContainer = document.createElement('div'),
					file = document.createElement('div'),
					titleContainer = document.createElement('div'),
					title = document.createElement('h4'),
					
					existentImage = this.element.parentElement.querySelector('img'),
					thumbnail = this.createBaseThumbnail(existentImage),
					thumbnailImage = thumbnail.querySelector('img');
				
				fileGroup.classList.add('humble-file-group');
				fileContainer.classList.add('humble-file-container');
				file.classList.add('humble-file');
				
				titleContainer.classList.add('humble-title-container');
				title.innerText = thumbnailImage.title;
				titleContainer.appendChild(title);
				
				label.classList.add('humble-file-label');
				label.htmlFor = this.element.name;
				labelText.innerText = this.placeholder;
				label.appendChild(labelText);
				
				file.appendChild(label);
				fileContainer.appendChild(titleContainer);
				fileContainer.appendChild(file);
				fileGroup.appendChild(thumbnail);
				fileGroup.appendChild(fileContainer);
				
				this.element.parentNode.appendChild(fileGroup);
				file.appendChild(this.element);
				
				if (typeof thumbnailImage !== undefined && thumbnailImage !== null) {
					if (thumbnailImage.classList.contains('hide')) {
						thumbnailImage.classList.remove('hide');
					}
					this.getImageScale(thumbnailImage);
				}
				
			} else if (this.element.classList.contains('humble-dropzone')) {
				
				this.type = HUMBLE_DROPZONE;
				
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					//
				} else {
					alert('The File APIs are not fully supported in this browser.');
					return false;
				}
				
				this.container = document.createElement('div');
				this.container.classList.add('humble-dropzone');
				this.container.classList.add('empty');
				this.container.setAttribute('id', this.element.name);
				
				this.container.addEventListener('dargstart', this.handleDragStart, false);
				this.container.addEventListener('dragenter', this.handleDragEnter, false);
				this.container.addEventListener('dragleave', this.handleDragLeave, false);
				this.container.addEventListener('dragover', this.handleDragOver, false);
				this.container.addEventListener('drop', this.handleSelectedFiles(this), false);
				
			} else if (this.element.classList.contains('humble-multifiles')) {
				
				this.type = HUMBLE_MULTIFILES;
				
				this.container = document.createElement('div');
				this.container.classList.add('humble-multifiles');
				
				label.classList.add('humble-file-label');
				labelText.innerHTML = this.placeholder;
				label.appendChild(labelText);
				
				label.addEventListener('click', function (evt) {
					var count = document.querySelectorAll('input[name*="' + self.element.name.substring(3, -1) + '"]').length,
						name = self.element.name,
						inputFile = self.createInputFile(null, count);
					
					label.htmlFor = name.replace('[]', '[' + count + '][]');
					self.container.appendChild(inputFile);
				}, false);
				
				this.container.appendChild(label);
				
			} else {
				alert('Can\'t find a element with a valid selector class');
				return false;
			}
			
			if (this.type === HUMBLE_DROPZONE || this.type === HUMBLE_MULTIFILES) {
				this.element.parentNode.replaceChild(this.container, this.element);
			}
		},
		checkTouch: function verifyTouch() {
			var html = document.querySelector('html'),
				isTouch = this.isTouch(),
				touch = 'touch',
				noTouch = 'no-touch';
			
			if (isTouch && html.classList.contains(touch)) {
				html.classList.add(touch);
				
			} else if (!isTouch && html.classList.contains(noTouch)) {
				html.classList.add(noTouch);
			}
		},
		isTouch: function isTouch() {
			var bool = false;
			
			if (window.ontouchstart !== undefined || (window.DocumentTouch && document instanceof DocumentTouch)) {
				bool = true;
			}
			
			return bool;
		},
		changeImagePreview: function (img, evt) {
			
			if (!evt.target.files.length) {
				return false;
			}
			
			var file = evt.target.files[0],
				fileName = this.getParent(img, 'humble-file-group').querySelector('label > span');
			
			this.checkFileType(file);
			
			if (fileName !== undefined && fileName !== null) {
				fileName.innerText = file.name;
			}
			
			this.reader = new FileReader();
			this.reader.onerror = this.readerOnErrorHandler;
			this.reader.onabort = this.readerOnAbortHandler;
			this.reader.onload = this.readerOnLoadHandler(file, img);
			this.reader.readAsDataURL(file);
		},
		checkFileType: function (file) {
			var extension = this.getExtension(file.name),
				proceed = false,
				supportedFormats = this.supportedFormats;
			
			if (typeof extension === 'undefined' || extension === null || !extension.length) {
				return false;
			}
			
			if (!supportedFormats.length) {
				return false;
			}
			
			switch (supportedFormats) {
				case '*':
					return true;
				case 'image/*':
					if (!file.type.match('image.*')) {
						return false;
					}
					break;
				case 'video/*':
				case 'audio/*':
					return false;
				default:
					for (var i = 0; i < supportedFormats.length; i++) {
						if (supportedFormats[i] === extension[0] || supportedFormats[i] === extension[1]) {
							proceed = true;
						}
					}
					if (!proceed) {
						return false;
					}
					break;
			}
			return true;
		},
		getExtension: function (name) {
			var patternFileExtension = /\.([0-9a-z]+)(?:[\?#]|$)/i;
			return name.match(patternFileExtension) || [];
		},
		getImageScale: function (img) {
			if (typeof img === 'undefined') {
				alert('Imagem não definida');
				return false;
			}
			var width = img.clientWidth,
				height = img.clientHeight,
				parentWidth = img.parentElement.clientWidth,
				parentHeight = img.parentElement.clientHeight,
				result = this.resizeImageBasedOnParent(width, height, parentWidth, parentHeight, false);
			
			img.style.height = result.height + 'px';
		},
		resizeImageBasedOnParent: function (width, height, parentWidth, parentHeight, fit) {
			var scaleX1 = Math.floor(parentWidth),
				scaleY1 = Math.floor((height * parentWidth) / width),
				scaleX2 = Math.floor((width * parentHeight) / height),
				scaleY2 = Math.floor(parentHeight),
				result = {width: 0, height: 0};
			if (fit) {
				result.width = scaleX1;
				result.height = scaleY1;
			} else {
				result.width = scaleX2;
				result.height = scaleY2;
			}
			return result;
		},
		createReferenceForDeletedFile: function (file) {
			var references = document.getElementById('humbleUploaderReferences'),
				inputHidden = this.createInputHidden(file.name);
			
			if (references === null) {
				references = document.createElement('div');
				references.id = 'humbleUploaderReferences';
				this.container.appendChild(references);
			}
			
			this.removeReferenceForInsertedFile(file);
			
			inputHidden.name = this.element.name.replace('[]', '[do_not_save][]');
			references.appendChild(inputHidden);
		},
		createReferenceForInsertedFile: function (file) {
			var references = document.getElementById('humbleUploaderReferences'),
				inputHidden = this.createInputHidden(file.name);
			
			if (references === null) {
				references = document.createElement('div');
				references.id = 'humbleUploaderReferences';
				this.container.appendChild(references);
			}
			
			this.removeReferenceForDeletedFile(file);
			
			inputHidden.name = this.element.name.replace('[]', '[do_save][]');
			references.appendChild(inputHidden);
		},
		removeReferenceForInsertedFile: function (file) {
			var self = this;
			var removedFiles = document.querySelectorAll('input[value="' + file.name + '"]');
			if (removedFiles.length) {
				removedFiles.forEach(function (toDelete, index) {
					if (toDelete.name === self.element.name.replace('[]', '[do_save][]')) {
						removedFiles[index].remove();
					}
				});
			}
		},
		removeReferenceForDeletedFile: function (file) {
			var self = this;
			var removedFiles = document.querySelectorAll('input[value="' + file.name + '"]');
			if (removedFiles.length) {
				removedFiles.forEach(function (toDelete, index) {
					if (toDelete.name === self.element.name.replace('[]', '[do_not_save][]')) {
						removedFiles[index].remove();
					}
				});
			}
		},
		getParent: function (el, className) {
			while (!el.classList.contains(className)) {
				el = el.parentElement;
			}
			return el;
		},
		createInputHidden: function (value) {
			var inputHidden = document.createElement('input');
			inputHidden.type = 'hidden';
			inputHidden.value = value;
			return inputHidden;
		},
		createInputFile: function (files, count) {
			var inputFile = document.createElement('input');
			
			inputFile.type = 'file';
			inputFile.multiple = true;
			if (this.supportedFormats !== '*') {
				inputFile.accept = this.supportedFormats;
			}
			inputFile.id = this.element.name.replace('[]', '[' + count + '][]');
			inputFile.name = this.element.name.replace('[]', '[' + count + '][]');
			
			if (this.type === HUMBLE_DROPZONE && typeof files !== 'undefined' && files !== null) {
				inputFile.files = files;
				inputFile.style.display = 'none';
			} else if (this.type === HUMBLE_MULTIFILES && typeof count !== 'undefined') {
				inputFile.addEventListener('change', this.handleSelectedFiles(this), false);
			}
			
			return inputFile;
		},
		createBaseThumbnail: function (img) {
			if (typeof img === 'undefined' || img === null || img === EMPTY) {
				img = document.createElement('img');
				img.src = this.imageDefault;
				img.style.height = this.thumbnail.height + 'px';
			}
			
			var thumbnail = document.createElement('div'),
				thumbnailContainer = document.createElement('div'),
				thumbnailImageContainer = document.createElement('div'),
				thumbnailButtonsContainer = document.createElement('div'),
				// thumbnailButtonPreview = document.createElement("a"),
				// thumbnailButtonDownload = document.createElement("a"),
				thumbnailButtonDelete = document.createElement('a'),
				image = img;
			
			thumbnail.classList.add('file-thumbnail');
			thumbnailContainer.classList.add('thumbnail-container');
			thumbnailButtonsContainer.classList.add('thumbnail-buttons');
			
			// thumbnailButtonPreview.classList.add("thumbnail-preview");
			// thumbnailButtonPreview.title = "Click to preview";
			//
			// thumbnailButtonDownload.classList.add("thumbnail-download");
			// thumbnailButtonDownload.title = "Click to download";
			
			thumbnailButtonDelete.classList.add('thumbnail-delete');
			thumbnailButtonDelete.title = 'Click to delete';
			
			
			if (this.type === HUMBLE_SINGLE) {
				thumbnailContainer.style.overflow = 'hidden';
				thumbnailContainer.classList.add('thumbnail-image-container');
				thumbnailContainer.style.width = this.thumbnail.width + 'px';
				thumbnailContainer.style.height = this.thumbnail.height + 'px';
				thumbnailContainer.appendChild(image);
				thumbnail.appendChild(thumbnailContainer);
			} else if (this.type === HUMBLE_DROPZONE || this.type === HUMBLE_MULTIFILES) {
				thumbnailImageContainer.style.overflow = 'hidden';
				thumbnailImageContainer.classList.add('thumbnail-image-container');
				
				thumbnailImageContainer.appendChild(image);
				thumbnailContainer.appendChild(thumbnailImageContainer);
				
				// thumbnailButtonsContainer.appendChild(thumbnailButtonPreview);
				// thumbnailButtonsContainer.appendChild(thumbnailButtonDownload);
				thumbnailButtonsContainer.appendChild(thumbnailButtonDelete);
				
				thumbnail.appendChild(thumbnailContainer);
				thumbnail.appendChild(thumbnailButtonsContainer);
			}
			return thumbnail;
		},
		createThumbnail: function (currentFile, separator) {
			var self = this,
				thumbnail = this.createBaseThumbnail(),
				thumbnailButtonsContainer = thumbnail.querySelector('.thumbnail-buttons'),
				thumbnailDelete = thumbnailButtonsContainer.querySelector(':scope > a.thumbnail-delete'),
				thumbnailContainer = thumbnail.querySelector('.thumbnail-container'),
				thumbnailImageContainer = thumbnailContainer.querySelector('.thumbnail-image-container');
			
			thumbnailImageContainer.style.borderWidth = this.thumbnail.border + 'px';
			thumbnailImageContainer.style.borderColor = this.thumbnail.borderColor;
			thumbnailImageContainer.style.borderStyle = 'solid';
			
			this.createReferenceForInsertedFile(currentFile, this.container);
			
			thumbnailDelete.addEventListener('click', function (evt) {
				
				evt.preventDefault();
				evt.stopPropagation();
				
				if (self.includedFiles.length) {
					
					for (var index = 0; index < self.includedFiles.length; index++) {
						
						if (self.includedFiles[index].name.toLowerCase() === currentFile.name.toLowerCase()) {
							
							thumbnail.classList.add('animated');
							thumbnail.classList.add('bounceOut');
							
							var t = setTimeout(function () {
								
								self.createReferenceForDeletedFile(currentFile, self.container);
								thumbnail.remove();
								
								var thumbnails = self.container.querySelectorAll('.thumbnail-separator > .file-thumbnail'),
									separators = self.container.querySelectorAll(':scope > .thumbnail-separator');
								
								if (separators.length) {
									for (var s = 0; s < separators.length; s++) {
										separators[s].remove();
									}
								}
								
								if (!self.includedFiles.length) {
									self.container.classList.add('empty');
								}
								
								var separator;
								
								for (var t = 0; t < thumbnails.length; t++) {
									separator = self.container.querySelector(':scope > .thumbnail-separator:not(.full)');
									if (separator === null) {
										separator = self.createSeparator();
										self.container.appendChild(separator);
									}
									separator.appendChild(thumbnails[t]);
									if (!((t + 1) % self.thumbnailGridSize)) {
										separator.classList.add('full');
									}
								}
								
								separator = self.container.querySelector(':scope > .thumbnail-separator:last-child');
								if (separator !== null) {
									var itemsPerRow = self.container.querySelectorAll('.thumbnail-separator:last-child > [class*="file-"]');
									if (itemsPerRow.length && separator !== null) {
										var x = itemsPerRow.length;
										while (x < self.thumbnailGridSize) {
											var emptyThumbnail = self.createEmptyThumbnail(separator);
											self.setThumbnailSize(emptyThumbnail, separator);
											separator.appendChild(emptyThumbnail);
											x++;
										}
									}
								}
								
								clearTimeout(t);
								
							}, 500);
							
							self.includedFiles.splice(index, 1);
							index = self.includedFiles.length;
							break;
						}
					}
				}
			}, false);
			self.setThumbnailSize(thumbnail, separator);
			return thumbnail;
		},
		createEmptyThumbnail: function (separator) {
			var thumbnail = document.createElement('div');
			thumbnail.classList.add('empty-thumbnail');
			this.setThumbnailSize(thumbnail, separator);
			return thumbnail;
		},
		createSeparator: function () {
			var separator = document.createElement('div');
			separator.classList.add('thumbnail-separator');
			return separator;
		},
		updateSeparator: function (separator) {
			var thumbnails = separator.querySelectorAll(':scope > .file-thumbnail');
			if (thumbnails.length === this.thumbnailGridSize) {
				separator.classList.add('full');
			}
		},
		insertOrReplaceThumbnail: function (thumbnail, separator) {
			var firstEmptyThumbnail = separator.querySelector(':scope > .empty-thumbnail');
			if (firstEmptyThumbnail !== null) {
				separator.replaceChild(thumbnail, firstEmptyThumbnail);
			} else {
				separator.appendChild(thumbnail);
			}
		},
		setThumbnailSize: function (thumbnail, separator) {
			var thumbnailButtonsContainer = thumbnail.querySelector('.thumbnail-buttons'),
				thumbnailContainer = thumbnail.querySelector('.thumbnail-container'),
				thumbnailImageContainer = thumbnail.querySelector('.thumbnail-image-container'),
				width = ((separator.offsetWidth / this.thumbnailGridSize)) + 'px',
				height = (separator.offsetHeight) + 'px';
			
			thumbnail.style.width = width;
			thumbnail.style.height = height;
			
			if (thumbnailButtonsContainer !== null) {
				width = ((separator.offsetWidth / this.thumbnailGridSize) - ((this.thumbnail.margin + this.thumbnail.border) * 2)) + 'px';
				thumbnailButtonsContainer.style.width = width;
				thumbnailButtonsContainer.style.bottom = (this.thumbnail.border * 3) + 'px';
			}
			
			if (thumbnailImageContainer !== null) {
				width = ((separator.offsetWidth / this.thumbnailGridSize) - ((this.thumbnail.margin + this.thumbnail.border) * 2)) + 'px';
				height = (separator.offsetHeight - ((this.thumbnail.margin + this.thumbnail.border) * 2)) + 'px';
				
				thumbnailImageContainer.style.width = width;
				thumbnailImageContainer.style.height = height;
			}
		},
		setAnimated: function (thumbnail) {
			thumbnail.classList.add('animated');
			thumbnail.classList.add('bounceIn');
			
			var t = setTimeout(function () {
				thumbnail.classList.remove('animated');
				thumbnail.classList.remove('bounceIn');
				clearTimeout(t);
			}, 1000);
		},
		handleDragStart: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			evt.dataTransfer.clearData();
		},
		handleDragEnter: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			evt.target.classList.add('drag-enter');
		},
		handleDragLeave: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			if (evt.target.classList.contains('drag-enter')) {
				evt.target.classList.remove('drag-enter');
			}
		},
		handleDragOver: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			evt.dataTransfer.dropEffect = 'copy';
		},
		handleSelectedFiles: function (self) {
			
			return function (evt) {
				
				evt.preventDefault();
				evt.stopPropagation();
				
				var dataTransfer = evt.dataTransfer,
					totalFiles = 0;
				
				if (typeof dataTransfer !== 'undefined') {
					if (dataTransfer.files.length) {
						self.files = dataTransfer.files;
						
						if (self.container.classList.contains('drag-enter')) {
							self.container.classList.remove('drag-enter');
						}
						
						if (self.container.classList.contains('empty')) {
							self.container.classList.remove('empty');
						}
					}
				} else {
					self.files = evt.target.files;
				}
				
				totalFiles = self.files.length;
				
				if (totalFiles) {
					
					var countChildrens,
						validIterator = 1,
						separator;
					
					if (totalFiles > 20) {
						totalFiles = 20;
					}
					
					for (var f = 0; f < totalFiles; f++) {
						
						separator = self.container.querySelector('.thumbnail-separator:not(.full)')
						
						var fileExistent = false,
							fileIsValid = true;
						
						if (self.includedFiles.length) {
							for (var i = 0; i < self.includedFiles.length; i++) {
								if (self.files[f].name.toLowerCase() === self.includedFiles[i].name.toLowerCase()) {
									fileExistent = true;
									break;
								}
							}
						}
						
						if (fileExistent) {
							continue;
						}
						
						fileIsValid = self.checkFileType(self.files[f]);
						if (!fileIsValid) {
							self.invalidFiles.push(self.files[f].name);
							continue;
						}
						
						if (separator === null && totalFiles > 0) {
							separator = self.createSeparator();
							self.container.appendChild(separator);
						}
						
						var thumbnail = self.createThumbnail(self.files[f], separator),
							img = thumbnail.querySelector('img');
						
						self.insertOrReplaceThumbnail(thumbnail, separator);
						
						self.updateSeparator(separator);
						
						//TODO Criar um evento para adicionar a imagem quando o thumbnail for adicionado
						self.reader = new FileReader();
						self.reader.onerror = self.readerOnErrorHandler;
						self.reader.onabort = self.readerOnAbortHandler;
						self.reader.onload = self.readerOnLoadHandler(self.files[f], img);
						self.reader.readAsDataURL(self.files[f]);
						
						self.includedFiles.push(self.files[f]);
						validIterator++;
					}
					
					countChildrens = separator.childElementCount;
					
					while (countChildrens < self.thumbnailGridSize) {
						separator.appendChild(self.createEmptyThumbnail(separator));
						countChildrens++;
					}
					
					if (self.type === HUMBLE_DROPZONE) {
						var count = document.querySelectorAll('input[name*="' + self.element.name.substring(3, -1) + '"]').length,
							name = self.element.name,
							inputFile = self.createInputFile(self.files, count);
						self.container.appendChild(inputFile);
					}
				}
				
				// var t = setTimeout(function () {
				//     thumbnails = self.separator.querySelectorAll(":scope > [class*=\"file-thumbnail\"]");
				//     clearTimeout(t);
				// }, 300);
				
				if (self.invalidFiles.length) {
					var msg = '';
					for (var n = 0; n < self.invalidFiles.length; n++) {
						msg += self.invalidFiles[n] + ' não é um arquivo válido.\n';
					}
					msg += '\nO formato destes arquivos não consta na declaração de formatos permitidos.';
					console.log(msg);
					self.invalidFiles = [];
				}
			}
		},
		readerOnLoadHandler: function (file, img) {
			var self = this;
			
			return function (evt) {
				
				evt.preventDefault();
				evt.stopPropagation();
				
				var thumbnail = self.getParent(img, 'file-thumbnail'),
					thumbnailContainer = self.getParent(img, 'thumbnail-container'),
					thumbnailImageContainer = thumbnailContainer.querySelector('.thumbnail-image-container'),
					extension = self.getExtension(file.name),
					currentFile = file;
				
				thumbnailContainer.style.backgroundRepeat = 'no-repeat';
				thumbnailContainer.style.backgroundPositionX = 'center';
				thumbnailContainer.style.backgroundPositionY = 'center';
				thumbnailContainer.style.backgroundSize = 'cover';
				
				switch (file.type) {
					case 'image/jpeg':
					case 'image/jpg':
					case 'image/gif':
					case 'image/png':
						img.src = evt.target.result;
						thumbnailContainer.style.backgroundImage = 'url("' + evt.target.result + '")';
						break;
					default:
						var fileName = document.createElement('div');
						fileName.classList.add('thumbnail-filename');
						fileName.innerText = file.name;
						thumbnailContainer.appendChild(fileName);
						
						img.parentElement.classList.add((extension.length && typeof extension[1] !== 'undefined' ? 'icon-' + extension[1] : ''));
						img.src = self.imageDefault;
						break;
				}
				
				img.onload = function (evt) {
					evt.preventDefault();
					evt.stopPropagation();
					var parentWidth = (thumbnailImageContainer !== null ? thumbnailImageContainer.clientWidth : self.thumbnail.width),
						parentHeight = (thumbnailImageContainer !== null ? thumbnailImageContainer.clientHeight : self.thumbnail.height);
					var result = self.resizeImageBasedOnParent(this.width, this.height, parentWidth, parentHeight);
					this.style.height = result.height + 'px';
					
					self.setAnimated(thumbnail);
				};
			}
		},
		readerOnErrorHandler: function (evt) {
			switch (evt.target.error.code) {
				case evt.target.error.NOT_FOUND_ERR:
					alert('File Not Found!');
					break;
				case evt.target.error.NOT_READABLE_ERR:
					alert('File is not readable');
					break;
				case evt.target.error.ABORT_ERR:
					break;
				default:
					alert('An error occurred reading this file.');
			}
		},
		readerOnAbortHandler: function () {
			this.reader.abort();
		}
	};
}(window, document));