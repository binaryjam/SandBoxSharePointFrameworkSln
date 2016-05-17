(function () {

    function init() {
        var x = document.getElementById('sandboxframeworkpart');
        x.innerHTML = "Hello World";
        
        sbfrmcomponent.createImage();
    }

    document.addEventListener("DOMContentLoaded", init);

})();
var sbfrmcomponent = (function(){
    var imgPath=_spPageContextInfo.siteAbsoluteUrl + "/SBFrameWork/SandboxFrameworkPart/";

    //I dont do anything yet
    function createImage(){
        var x = document.getElementById('galaxyimg');
        x.innerHTML = "<img src='" + imgPath + "galaxyimg.jpg'/>";
    }
    
    return {
        createImage:createImage
    };

})();