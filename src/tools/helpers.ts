/**
 * Method used to remove an element from an array
 * @param arr The array
 * @param value The value to remove
 * @returns The new array
 */
export const arrayRemove = (arr:any[], value:any): any[] => { 
    return arr.filter(function(ele){ 
        return ele !== value; 
    });
}