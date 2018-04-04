var IMG_EXPANDED  = 'Expanded.png';
var IMG_COLLAPSED = 'Collapsed.png';
var IMG_BLANK = 'blank.png';
var IMG_LEAF = 'LeafRowHandle.png';

function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
    if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}

function isVisible(obj)
{
    if (obj == document)
        return true;
    
    if (!obj)
        return false;
    if (!obj.parentNode)
        return false;
    if (obj.style) {
        if (obj.style.display == 'none')
            return false;
        if (obj.style.visibility == 'hidden')
            return false;
    }
    
    //Try the computed style in a standard way
    if (window.getComputedStyle) {
        var style = window.getComputedStyle(obj, "");
        if (style.display == 'none')
            return false;
        if (style.visibility == 'hidden')
            return false;
    }
    
    //Or get the computed style using IE's silly proprietary way
    var style = obj.currentStyle
    if (style) {
        if (style['display'] == 'none')
            return false;
        if (style['visibility'] == 'hidden')
            return false;
    }
    return isVisible(obj.parentNode);
}

function updateRowBackgroundColors() {
    // do not update row colors unless alternate row colors has been specified.
    if (!(hasClass(document.body, "alt-row-colors")))
        return;
    var possibleRows = document.getElementsByClassName("whole-row");
    var rowCount = 1;
    for(var i = 0; i < possibleRows.length; i++) {
        var element = possibleRows[i];
        var elementNote = null;
        if ((element.nextElementSibling != null) && (hasClass(element.nextElementSibling, "whole-note"))) {
            elementNote = element.nextElementSibling;
        }
        if (rowCount % 2 == 0) {
            addClass(element, "alt-row");
            if (elementNote != null) {
                addClass(elementNote, "alt-row");
            }
        }
        rowCount++;
    }
}


function setLastChildClass(rowSet) {
    // This is used for setting "Below children" padding
    var rows = [];
    if (rowSet == null) {
        rows = document.querySelectorAll("tr.outline-row, tr.note-row");
    } else {
        rows = rowSet;
    }
    $(rows).each(function() {
                 var element = $(this);
                 var siblingCount = $(element).siblings().length;
                 for (var i = 0; i < siblingCount; i++) {
                 // Get next visible sibling in the whole DOM
                 if ($(element).next()[0] != null) {
                 if ($(element).next().hasClass("visible")) {
                 // See if the next visible sibling is of a numerically lower data-level
                 if ($(element).next().attr("data-level") < $(this).attr("data-level")) {
                 $(this).addClass("last-child");
                 }
                 break;
                 } else {
                 element = $(element).next();
                 }
                 } else {
                 break;
                 }
                 }
                 });
}


function setWidths() {
    var everyRow = document.querySelectorAll("table.whole-row, table.whole-note");
    var previousLevel = 1;
    var everyCellToModify = [];
    for (var i = 0; i < everyRow.length; i++) {
        // Set level 1 row widths
        if (i == 0) {
            everyCellToModify.pushArray(setWidthsForSectionLevel(everyRow[0]));
        } else {
            var nextRow = everyRow[i].nextElementSibling;
            var thisDataLevel = everyRow[i].getAttribute("data-level");
            // Set widths for all other row levels
            if (thisDataLevel > previousLevel) {
                everyCellToModify.pushArray(setWidthsForSectionLevel(everyRow[i]));
                previousLevel = thisDataLevel;
            } else if ((nextRow !== null) && (thisDataLevel < previousLevel)) {
                // Should have already adjust this row but we need to check for children
                previousLevel = thisDataLevel;
            }
        }
    }
    for (var i = 0; i < everyCellToModify.length; i++) {
        everyCellToModify[i][0].style.width = (everyCellToModify[i][1] + "px");
        if (everyCellToModify[i][1] > 1) {
            removeClass(everyCellToModify[i][0], "empty");
        }
    }
}

function setWidthsForSectionLevel(startRow) {
    var currentLevel = startRow.getAttribute("data-level");
    var everyRowOfLevelInSection = [];
    var everyLabelTdInSection = [];
    var stillInSection = true;
    var labelTd = startRow.querySelector("td.label");
    everyLabelTdInSection.push(labelTd);
    var styleOfLabelTd = window.getComputedStyle(labelTd, null);
    everyRowOfLevelInSection.push(startRow);
    var maxWidth = parseInt(styleOfLabelTd.getPropertyValue("width"));
    var currentRow = startRow;
    while (stillInSection == true) {
        var nextRow = currentRow.nextElementSibling;
        var thisDataLevel = (nextRow != null) ? Number(currentRow.nextElementSibling.getAttribute("data-level")) : null;
        if (thisDataLevel ==  currentLevel) {
            everyRowOfLevelInSection.push(nextRow);
            labelTd = nextRow.querySelector("td.label");
            everyLabelTdInSection.push(labelTd);
            styleOfLabelTd = window.getComputedStyle(labelTd, null);
            var width = parseInt(styleOfLabelTd.getPropertyValue("width"));
            if (width > maxWidth) {
                maxWidth = width;
            }
        } else if ((nextRow == null) || (thisDataLevel < currentLevel))  {
            stillInSection = false;
        }
        currentRow = nextRow;
    }
    
    var cellsToModify = [];
    for (var i = 0; i < everyLabelTdInSection.length; i++) {
        cellsToModify.push([everyLabelTdInSection[i], maxWidth]);
    }
    return cellsToModify;
}

function setOutlineTitleInset() {
    var headerRow = document.getElementById("header");
    var firstRow = document.querySelector("table.whole-row");
    var outlineTitleDiv = document.getElementById("outlineInset");
    if (outlineTitleDiv != null) {
        var firstRowOutlineCells = firstRow.querySelector("table.outline-column").getElementsByTagName("td");
        var insetWidth = 0;
        for (var i = 0; i < (firstRowOutlineCells.length - 1); i++) {
            var width = parseInt(firstRowOutlineCells[i].offsetWidth);
            insetWidth = insetWidth + width;
        }
        outlineTitleDiv.style.paddingLeft = (insetWidth + "px");
    }
}

function ieScript() {
    if ((!!navigator.userAgent.match(/Edge\/\d+/i)) || (!!navigator.userAgent.match(/Trident\/\d+/i))){
        //Set the height of table rows for IE and Edge
        var everyRow = document.querySelectorAll("table#outline > tbody > tr");
        var everyRowHeight = [];
        for (var i = 0; i < everyRow.length; i++) {
            everyRowHeight.push(everyRow[i].offsetHeight);
        }
        for (var i = 0; i< everyRow.length; i++) {
            everyRow[i].style.height = everyRowHeight[i] + "px";
        }
    }
}



function getNum(val) {
    if (isNaN(val)) {
        return 0;
    }
    return Number(val);
}

Array.prototype.pushArray = function() {
    var toPush = this.concat.apply([], arguments);
    for (var i = 0, len = toPush.length; i < len; ++i) {
        this.push(toPush[i]);
    }
};

function setup() {
    setWidths(); // Run this before setting visiblity so all rows are visible at time of calculation
    ieScript();  // This too
    setOutlineTitleInset();
    //setLastChildClass();
    updateRowBackgroundColors();
}

window.onload = setup;


