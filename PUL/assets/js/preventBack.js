function preventBack()
{
    window.history.forward();
}

setTimeout("preventBack()", 0);

window.onunload = function() {alert("You can't")};