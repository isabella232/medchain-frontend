export const arrayRemove = (arr:any[], value:any): any[] => { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}