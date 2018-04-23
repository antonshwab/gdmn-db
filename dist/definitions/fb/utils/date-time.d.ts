/*******************************************************************************
 The MIT License (MIT)
 Copyright (c) 2013-2016 Hajime Nakagami
 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/
/** Decode a date. */
export declare function decodeDate(date: number): {
    year: number;
    month: number;
    day: number;
};
/** Encode a date. */
export declare function encodeDate(year: number, month: number, day: number): number;
/** Descode a time. */
export declare function decodeTime(time: number): {
    hours: number;
    minutes: number;
    seconds: number;
    fractions: number;
};
/** Encode a time. */
export declare function encodeTime(hours: number, minutes: number, seconds: number, fractions: number): number;
