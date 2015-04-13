/**
 * Created by adaltojunior on 4/8/15.
 */
RoInlineMenu = new Ro.Controller('roInlineMenu', {

    init: function () {

    },
    toggleInlineMenu: function (index) {
        var item = this.view.querySelector('ro-list > ro-item:nth-child('+ index +')');
        item.querySelector('ro-inline-menu').toggle();
    }

});