(function () {

    xtag.register('ro-input', {
        lifecycle: {
            created: function () {
                if (!this.innerHTML.trim()) {

                    this.xtag.field = document.createElement('input');
                    this.xtag.field.type = this.getAttribute('type');
                    this.xtag.field.value = this.getAttribute('value');
                    this.xtag.field.name = this.getAttribute('name');

                    if(this.getAttribute('mandatory') === ""){
                        this.xtag.field.setAttribute("mandatory", "");
                    }

                    this.addPlaceholder();
                    this.addIcon();

                    this.appendChild(this.xtag.field);

                    this.removeAttribute('i18n');

                }
            },
            inserted: function () {
            },
            removed: function () {
            }
        },
        events: {},
        accessors: {},
        methods: {
            addPlaceholder: function(){
                var placeholder = this.getAttribute('placeholder');
                if(placeholder || placeholder === ""){
                    this.xtag.field.setAttribute('i18n', this.getAttribute('i18n'));
                    this.xtag.field.setAttribute('i18nKey', this.getAttribute('i18nKey'));
                    this.xtag.field.placeholder = placeholder;
                }
                delete placeholder;
            },
            addIcon: function(){
                var icon = this.getAttribute('icon');
                if(icon){
                    this.xtag.icon = document.createElement('ro-icon');
                    this.xtag.icon.setAttribute('iconName', icon);
                    this.appendChild(this.xtag.icon);
                }
                delete icon;
            }
        }
    });

})();
