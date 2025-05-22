$(document).ready(function(){
    $("input.login_input").focus(function(){
        $(this).removeClass("default");
        $(this).removeClass("error");
        if ($(this).val() == $(this).attr("data-default"))
            $(this).val('');
    })
    
    $("input.login_input").blur(function(){
        if ($(this).val() == '')
        {
            $(this).addClass("default");
            $(this).val($(this).attr("data-default"));
        }
         
    })

    
    $("input#fake_password_input").focus(function(){
        $(this).removeClass("error");
        $("input#password_input").removeClass("error");
        
        $(this).hide();
        $("input#password_input").show();
        $("input#password_input").focus();
    })
    
    $("input#password_input").blur(function(){
        if ($(this).val() == '')
        {
            $(this).hide();
            $("input#fake_password_input").show();        
        }
        
    })  
    

})