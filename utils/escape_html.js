const sanitize_html = (unsanitized)=> (
    
    unsanitized
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
    
 
)

module.exports = {
    sanitize_html
}