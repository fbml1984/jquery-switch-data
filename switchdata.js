/*
 * @license
 *
 * Switch Data v0.0.1
 * https://github.com/fbml1984/jquery-switch-data
 *
 * Copyright (c) 2018-2018 Fábio Lazaro
 * Licensed under the MIT license (https://github.com/fbml1984/jquery-switch-data/blob/master/LICENSE)
 */
"use strict";
(function ($) {
    $.fn.switchData = function (options) {
        var settings = $.extend({
            receiveFromExternal: false,
            receiveFrom: null,
            observeWhenChange: null,
            search: {
                url: null,
                resultPair: {
                    key: "key",
                    value: "value"
                },
                placeholder: null,
                excludeFrom: []
            }
        }, options);
        //...
        return this.each(function (i, $dataFrom) {

            var $selectLeft = $($dataFrom),
                $optionsSelectLeft = $("option", $selectLeft),
                $parent = $selectLeft.closest("div[class*=\"jumbotron\"]"),
                $selectRight = $(".switch-left", $parent),
                $optionsSelectRight = $("option", $selectRight),
                $btnMoveToLeft = $("[class*=\"left-all\"]", $parent),
                $btnMoveToRight = $("[class*=\"right-all\"]", $parent),
                $selectToObserve = $(settings.observeWhenChange, $parent),
                $leftUL = $("<ul/>").attr("id", $selectLeft.attr("name")),
                $rightUL = $("<ul/>").attr("id", $selectRight.attr("name"));

            $selectRight.parent().append($rightUL);
            $selectLeft.parent().append($leftUL);

            _initialize("origin", $selectRight, $optionsSelectRight, $optionsSelectLeft, $rightUL, $leftUL);
            _initialize("destiny",$selectRight, $optionsSelectRight, $optionsSelectLeft, $rightUL, $leftUL);

            if (settings.receiveFromExternal && settings.receiveFrom !== null && settings.observeWhenChange !== null && $selectToObserve.length) {
                $selectToObserve.on("change", function () {
                    $.when(settings.receiveFrom($(this).val())).done(function (response) {
                        if (response.length || response !== null) {
                            var items = [];
                            $.each(response, function (key, value) {
                                items.push(_createLIFromKeyAndValue(value, key, "destiny", $selectRight, $rightUL, $leftUL));
                            });
                            $.when($leftUL.html(items)).done(function () {
                                _checkDuplicatedValues($rightUL, $leftUL);
                            });
                        }
                    }).fail(function (error) {
                        $leftUL.html("");
                        console.log(error);
                    });
                });
            }

            if (settings.search && settings.search.url !== undefined && settings.search.url != null) {
                var includeFireSearch = true;
                if (settings.search.excludeFrom !== undefined) {
                    if (settings.search.excludeFrom.indexOf($selectLeft.attr("name")) > -1) {
                        includeFireSearch = false;
                    }
                }
                if (includeFireSearch) {
                    var $inputSearch = $("<input/>")
                        .attr("type", "text")
                        .attr("name", "q")
                        .attr("placeholder", options.search.placeholder)
                        .addClass("form-control");

                    var $clear = $("<button/>")
                        .attr("type", "button");

                    $clear.on("click", function () {
                        $inputSearch.val("");
                        $leftUL.html("");
                    });

                    $inputSearch.insertBefore($selectLeft);
                    $clear.insertBefore($selectLeft);

                    $("[name=\"q\"]", $parent).on("keyup", function () {
                        _fireSearch(this.value, $selectRight, $rightUL, $leftUL);
                    });
                }
            }

            //Move all itens to origin
            $btnMoveToLeft.on("click", function () {
                var countLeftLI = $("li", $leftUL).length;
                $("li", $rightUL).each(function (i, rightLI) {
                    var rightID = $(rightLI).attr("id");
                    var _append = true;
                    if (countLeftLI) {
                        $("li", $leftUL).each(function (i, leftLI) {
                            var leftID = $(leftLI).attr("id");
                            if (rightID === leftID) {
                                return _append = false;
                            }
                        });
                    }
                    if (_append) {
                        _createLIFromLI(rightLI, "destiny", $selectRight, $rightUL, $leftUL).appendTo($leftUL);
                        $("option[value=\"" + rightID + "\"]:selected", $selectRight).remove();
                        $(rightLI).remove();
                    }
                    _sortList($leftUL[0]);
                });
            });

            //Move all itens to destiny
            $btnMoveToRight.on("click", function () {
                var countRightLI = $("li", $rightUL).length;
                $.each($("li", $leftUL), function (i, leftLI) {
                    var leftID = $(leftLI).attr("id");
                    var _append = true;
                    if (countRightLI) {
                        $("li", $rightUL).each(function (i, rightLI) {
                            var rightID = $(rightLI).attr("id");
                            if (leftID === rightID) {
                                return _append = false;
                            }
                        });
                    }
                    if (_append) {
                        _createLIFromLI(leftLI, "origin", $selectRight, $rightUL, $leftUL).appendTo($rightUL);
                        _createOptionFromLI(leftLI).appendTo($selectRight);
                        $(leftLI).remove();
                    }
                    _sortList($rightUL[0]);
                });
            });
        });

        function _initialize(direction, $selectRight, $optionsSelectRight, $optionsSelectLeft, $rightUL, $leftUL) {
            var options, UL;
            if (direction === "destiny") {
                options = $optionsSelectLeft;
                UL = $leftUL;
            } else {
                options = $optionsSelectRight;
                UL = $rightUL;
            }

            if (typeof options !== "undefined" &&
                options !== undefined &&
                options !== null &&
                options.length > 0
            ) {
                var items = [];
                $.each(options, function (i, option) {
                    $(option).attr("selected", true);
                    var $li = _createLIFromOption(option, direction, $selectRight, $rightUL, $leftUL);
                    items.push($li);
                });
                $(UL).html(items);
            }
        }

        function _checkDuplicatedValues($rightUL, $leftUL) {
            var countLeftLI = $("li", $leftUL).length;
            $("li", $rightUL).each(function (i, rightLI) {
                var rightID = $(rightLI).attr("id");
                if (countLeftLI) {
                    $("li", $leftUL).each(function (i, leftLI) {
                        var leftID = $(leftLI).attr("id");
                        if (rightID === leftID) {
                            $(leftLI).addClass("repeated");
                        }
                    });
                }
            });
        }

        function _move(item, direction, $selectRight, $rightUL, $leftUL) {
            let id = $(item).attr("id");
            let text = $(item).text();
            var exists = false;
            if (direction === "destiny") {
                exists = $("option[value=\"" + id + "\"]", $selectRight).length;
                if (exists) {
                    return false;
                }
                $rightUL.append(_createLIFromKeyAndValue(id, text, "origin", $selectRight, $rightUL, $leftUL));
                $selectRight.append(_createOptionFromKeyAndValue(id, text, true));
                $(item, $leftUL).remove();
            } else if (direction === "origin") {
                exists = $("li[id=\"" + id + "\"]", $leftUL).length;
                if (exists) {
                    $("li[id=\"" + id + "\"]", $leftUL).removeClass("repeated");
                    $("option[value=\"" + id + "\"]", $selectRight).remove();
                    $(item, $rightUL).remove();
                    return false;
                }
                $leftUL.append(_createLIFromKeyAndValue(id, text, "destiny", $selectRight, $rightUL, $leftUL));
                $("option[value=\"" + id + "\"]", $selectRight).remove();
                $(item, $rightUL).remove();
            }
            _sortList($leftUL[0]);
            _sortList($rightUL[0]);
        }

        function _fireSearch(q, $selectRight, $rightUL, $leftUL) {
            if (q.length < 3) {
                $leftUL.html("");
                return false;
            }
            //...
            $.ajax({
                method: "GET",
                url: options.search.url.replace("%QUERY", q)
            }).done(function (response) {
                if (response.length) {
                    var items = [];
                    for (var i in response) {
                        items.push(_createLIFromKeyAndValue(response[i][options.search.resultPair.key], response[i][options.search.resultPair.value], "destiny", $selectRight, $rightUL, $leftUL));
                    }
                    $.when($leftUL.html(items)).done(function () {
                        _checkDuplicatedValues($rightUL, $leftUL);
                    });
                }
            }).fail(function () {
                $leftUL.html("");
                console.log("Erro ao pesquisar os usuários cujo nome contenha [termo=" + q + "]");
            });
        }

        function _createLIFromKeyAndValue(id, text, direction, $selectRight, $rightUL, $leftUL) {
            return $("<li/>")
                .attr("id", id)
                .html(text)
                .on("click", function () {
                    _move(this, direction, $selectRight, $rightUL, $leftUL);
                });
        }

        function _createLIFromLI(li, direction, $selectRight, $rightUL, $leftUL) {
            return $("<li/>")
                .attr("id", $(li).attr("id"))
                .html($(li).text())
                .on("click", function () {
                    _move(this, direction, $selectRight, $rightUL, $leftUL);
                });
        }

        function _createLIFromOption(option, direction, $selectRight, $rightUL, $leftUL) {
            return $("<li/>")
                .attr("id", $(option).val())
                .html($(option).text())
                .on("click", function () {
                    _move(this, direction, $selectRight, $rightUL, $leftUL);
                });
        }

        function _createOptionFromKeyAndValue(id, text, selected) {
            return $("<option/>")
                .attr("value", id)
                .attr("selected", selected)
                .html(text);
        }

        function _createOptionFromLI(li) {
            return $("<option/>")
                .attr("value", $(li).attr("id"))
                .attr("selected", true)
                .html($(li).text());
        }

        function _sortList(list) {
            if (list === undefined) {
                return;
            }
            var i, switching, b, shouldSwitch;
            switching = true;
            /*Make a loop that will continue until
            no switching has been done:*/
            while (switching) {
                //start by saying: no switching is done:
                switching = false;
                b = list.getElementsByTagName("LI");
                //Loop through all list-items:
                for (i = 0; i < (b.length - 1); i++) {
                    //start by saying there should be no switching:
                    shouldSwitch = false;
                    /*check if the next item should
                    switch place with the current item:*/
                    if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                        /*if next item is alphabetically
                        lower than current item, mark as a switch
                        and break the loop:*/
                        shouldSwitch = true;
                        break;
                    }
                }
                if (shouldSwitch) {
                    /*If a switch has been marked, make the switch
                    and mark the switch as done:*/
                    b[i].parentNode.insertBefore(b[i + 1], b[i]);
                    switching = true;
                }
            }
        }
    };
}(jQuery));