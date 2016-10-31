$(function () {
    function onScroll() {
        $('.pageContent').each(function () {
            var y = $(document).scrollTop();
            var h = $(window).height();
            var t = $(this).parent().offset().top;
            if (y + h / 2 >= t) {
                $(this).fadeIn();
            } else {
                $(this).fadeOut();
            }
        });

        var background = $('#background');
        var dy = $(document).scrollTop();
        var dh = $(document).height();

        var bh = background.height();
        var by = background.css('top');

        var wh = $(window).height();

        background.css('top', -(bh - wh) * dy / (dh - wh));
    }
    $(window).bind('scroll', function () {
        onScroll();
    });
    onScroll();
})