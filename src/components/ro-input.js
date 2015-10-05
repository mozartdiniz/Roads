(function () {

    xtag.register('ro-input', {
        lifecycle: {
            created: function () {
                if (!this.innerHTML.trim()) {

                    this.xtag.field = document.createElement('input');
                    this.xtag.field.type = this.getAttribute('type');
                    this.xtag.field.value = this.getAttribute('value');
                    this.xtag.field.name = this.getAttribute('name');

                    if(this.getAttribute("pattern")){
                        this.xtag.field.setAttribute("pattern", this.getAttribute("pattern"));
                    }
                    if(this.getAttribute("maxsize")){
                        this.xtag.field.setAttribute("maxsize", this.getAttribute("maxsize"));
                    }
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
        events: {
            "keyup:delegate(input)": function(e){
                var maxSize = this.getAttribute("maxsize");
                if(maxSize && this.value.length > maxSize){
                    this.value = this.value.substr(0, maxSize);
                }
            }
        },
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
            },
            validate: function(){
                var value = this.querySelector("input").value,
                    mandatory = this.getAttribute("mandatory"),
                    maxsize = this.getAttribute("maxsize"),
                    pattern = this.getAttribute("pattern"),
                    valid = true,
                    regex = null,
                    match = null;

                if(maxsize && value.length > maxsize){
                    valid = "MAXSIZE";
                }
                if(pattern && value.length !== 0){
                    regex = new RegExp(pattern);
                    match = value.match(regex);

                    if(match && !(match[0] === value)){
                        valid = "PATTERN";
                    }else if(!regex.test(value)){
                        valid = "PATTERN";
                    }
                }
                if(mandatory !== null && value.length === 0){
                    valid = "MANDATORY";
                }
                return valid;
            }
        }
    });

})();