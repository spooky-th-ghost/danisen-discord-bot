"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordTable = exports.createDiscordTable = void 0;
function createDiscordTable(props) {
    return new DiscordTable(props).constructTable();
}
exports.createDiscordTable = createDiscordTable;
const DEFAULT_MAX_COLUMN_LENGTH = 50;
const DEFAULT_SPACES_BETWEEN_COLUMNS = 5;
class DiscordTable {
    constructor(props) {
        this._headers = props.headers;
        this._spacesBetweenColumns = props.spacesBetweenColumns;
        this._maxColumnLengths = props.maxColumnLengths;
        this._content = props.content;
        this._ignoreFormatting = !!props.ignoreFormatting;
    }
    constructTable() {
        let contentCopy = JSON.parse(JSON.stringify(this._content));
        if (this._headers) {
            contentCopy.unshift(this._headers);
        }
        // make sure the table responds to the maxColumnLengths restrictions
        contentCopy = DiscordTable._adjustTableToSettingsIfNeeded(contentCopy, this._maxColumnLengths);
        // compute the max length taken by each column
        const columnLengths = DiscordTable._computeMaxColumnLengths(contentCopy);
        // compute max number of sublines per line
        const numberOfSublines = DiscordTable._computeNumberSublines(contentCopy);
        // build the table
        const returnValue = [];
        // for each line
        for (let line = 0; line < contentCopy.length; line++) {
            // for up to the higher number of sub-cells existing in the line
            for (let subLine = 0; subLine < numberOfSublines[line]; subLine++) {
                let returnLine = "";
                // for each column
                for (let column = 0; column < contentCopy[line].length; column++) {
                    const columnLength = columnLengths[column] + ((this._spacesBetweenColumns && this._spacesBetweenColumns[column])
                        ? this._spacesBetweenColumns[column] : DEFAULT_SPACES_BETWEEN_COLUMNS);
                    const cell = contentCopy[line][column];
                    const sublineValue = cell[subLine] ? cell[subLine] : "";
                    returnLine += DiscordTable._makeAppropriateTableString(sublineValue, columnLength);
                }
                returnValue.push(returnLine || " ");
            }
        }
        if (this._ignoreFormatting) {
            return returnValue;
        }
        else {
            return DiscordTable._code(returnValue);
        }
    }
    static _computeNumberSublines(content) {
        const returnValue = [];
        for (const line of content) {
            let maxNumberSublines = 1;
            for (const cell of line) {
                if (cell.length > maxNumberSublines) {
                    maxNumberSublines = cell.length;
                }
            }
            returnValue.push(maxNumberSublines);
        }
        return returnValue;
    }
    static _computeMaxColumnLengths(content) {
        const numberOfColumns = content[0].length;
        const returnValue = [];
        for (let column = 0; column < numberOfColumns; column++) {
            let maxLengthFound = 0;
            for (let line = 0; line < content.length; line++) {
                const cell = content[line][column];
                if (cell) {
                    for (const subLine of cell) {
                        const sublineLength = subLine.length;
                        if (sublineLength > maxLengthFound) {
                            maxLengthFound = sublineLength;
                        }
                    }
                }
            }
            returnValue.push(maxLengthFound);
        }
        return returnValue;
    }
    static _adjustTableToSettingsIfNeeded(content, maxColumnLengths) {
        let returnValue = [];
        // 1st run: each subline of a cell must be shorter than the column limit length
        // for each line
        for (let line = 0; line < content.length; line++) {
            // for each column
            let parsedLine = [];
            for (let column = 0; column < content[line].length; column++) {
                const maxColumnLength = (maxColumnLengths && maxColumnLengths[column]) ? maxColumnLengths[column] : DEFAULT_MAX_COLUMN_LENGTH;
                const cell = content[line][column];
                let newCell = [];
                for (const subLine of cell) {
                    newCell = newCell.concat(DiscordTable._splitStringByMaxLength(subLine, maxColumnLength));
                }
                // push the checked cell to the current line
                parsedLine.push(newCell);
            }
            // the line has been checked. push it to the content
            returnValue.push(parsedLine);
        }
        return returnValue;
    }
    static _makeAppropriateTableString(value, columnLength) {
        let difference = value ? columnLength - value.length : columnLength;
        if (difference <= 0) {
            return value;
        }
        else {
            for (let i = 0; i < difference; i++) {
                value += " ";
            }
            return value;
        }
    }
    static _splitStringByMaxLength(stringToSplit, maxLength) {
        if (!stringToSplit) {
            return [];
        }
        let current = maxLength;
        let previous = 0;
        const output = [];
        while (stringToSplit[current]) {
            if (stringToSplit[current++] === " ") {
                output.push(stringToSplit.substring(previous, current));
                previous = current;
                current += maxLength;
            }
        }
        output.push(stringToSplit.substring(previous));
        return output;
    }
    static _code(messages) {
        const returnValue = messages;
        returnValue[0] = "```" + returnValue[0];
        returnValue[returnValue.length - 1] = returnValue[returnValue.length - 1] + "```";
        return returnValue;
    }
}
exports.DiscordTable = DiscordTable;
