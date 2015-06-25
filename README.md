Roads
=====

Roads is a WebComponents based MVC JavaScript framework.

## Getting started

What you will need to start a new Roads app is get all lib dependencies at lib folder plus roads.js and roads.css at dist folder.

	lib/hammer.js
	lib/iscroll-min.js
	lib/ol.js        # only if you will use ro-map tag
	lib/ol-deps.js   # only if you will use ro-map tag
	lib/x-tag.js
	
	dist/roads.min.js
	dist/roads.css

## Roads app anatomy

### Views
Roads uses individual files to define each screen layout, in master detail example, at examples folder, wee have three diferent html files at views filder:

	categories.html
	tasks.html
	tasksDetail.html
	
#### A minimal view layout

	<ro-view id="tasks" ro-controller="tasks">
		<ro-header>
			<ro-topbar>
				<ro-back-button text="Categories" icon="coisa"></ro-back-button>
				<ro-title>Tasks</ro-title>
			</ro-topbar>
		</ro-header>
		<ro-stage>    	
		</ro-stage>
	</ro-view>
	
**ro-view**	This is the screen layout base, the attribute id is to be referenced when you need navigate from one screen to another, the attribute ro-controller is which acontroller will control this view.

**ro-header** Is a placement where you can add everything that should be fixed at top of screen

**ro-topbar** Render a top bar component.

**ro-back-button** If the app is running in a IOS or FirefoxOS display a backbutton to back to previous screen, if is running in a Android or Windows Phone this button will be automatically hidden.

**ro-title** Where screen title goes

**ro-stage** Here is the "body" of your app

### Controllers

By default, each view will have a controller, but controllers can control how many views are needed.

	Todo.Controllers.Tasks = new Ro.Controller('tasks', {
		init: function () {
		},

		show: function () {
		}
	});

**init** This function will run when a new controller is initialized, usually this runs once and when the app is initialized.

**show** Runs every time that the views controlled by this controller become visible, you will use this method to update view content or change the backbutton callback function.

### Main.js

Here how a basic main.js file will look like:

	//This callback function will run when all views are loaded
	Ro.init (function () {

		// this code will calculate all view positions
		// show the main view and hide all others
		
    	RoApp.putViewsInFirstPosition ();

		// You will need initialize the controllers
		// This is the moment when init method will run
		
		Todo.categories  = new Todo.Controllers.Categories ();
		Todo.tasks       = new Todo.Controllers.Tasks ();
		Todo.taskDetail  = new Todo.Controllers.TaskDetail ();

	});

A typical Roads app should have a index.html file.

	<!DOCTYPE html>
	<html>
		<head>
			<!-- All javascripts and CSSs related files -->
			
			<link rel="import" href="views/tasks.html">
			
		</head>
		<body>
			<ro-loader></ro-loader>
	  		<ro-app id="RoApp"></ro-app>
		</body>
	</html>

**link rel="import"** This tag is how you will relate your view files in the app, all these layouts will be loaded and only after that Ro.ini callback will run.

**ro-load**: Is a loader component, Roads will use when is loading all your files.
**ro-app**: This is the main app tag, all other tags will be appended here.

## Roads Tags

### ro-app

**gotoView(from, to)** Is how you can navigate between views.

**backtoView(from, to)** Is the same as gotoView, but the animation is in inverse direction.

Both gotoView and backtoView will trigger 'show' method from related view controller.

### ro-list

    <ro-list>
      <ro-item action="doSomething()">
        {{description}}
      </ro-item>
    </ro-list>

**ro-item** Is the item layout, will be used as a template, Ro uses the template engine to render ro-item content replacing all {{}} by related data.

**ro-item[action]** This is the function that will be trigged when user tap a ro-item, also is possible use dynamic parameters using template syntax, doSomething({{id}}) will be replaced by current item id.

**setData()** Is how to add a list of items to a ro-list, every time that a setData() is called ro-list parse the content again.

	var list = document.querySelector ('ro-list');
	var data = [{desciption: 'a'}, {desciption: 'b'}];
	list.setData(data);

### ro-input
### ro-layout
### ro-map
### ro-tabs
### ro-tabs
### ro-float-menu

![Alt text](https://cdn1.vox-cdn.com/thumbor/CHlsepYrnKp0JzEQro4rnda7BeY=/cdn0.vox-cdn.com/uploads/chorus_asset/file/3329476/inbox-3up.0.png)

Float menu reproduce a very similar behavior to Android's Material Design.

	<ro-float-menu icon="More" iconActive="Close" state="hideItems">

		<ro-item icon="NewDocument"
           text=""
           i18n="text"
           i18nKey="{{menus.newDocument | i18n}}"
           action="RoApp.gotoView ('docs', 'newEdit');"></ro-item>

		<ro-item icon="EditDocument"
             text=""
             i18n="text"
             i18nKey="{{menus.editDocument | i18n}}"
             action="RoApp.gotoView ('docs', 'docsEdit');"></ro-item>

		<ro-item icon="DeleteDocument"
             text=""
             i18n="text"
             i18nKey="{{menus.deleteDocument | i18n}}"
             action="myApp.Documents.Delete()"></ro-item>

	</ro-float-menu>

Each ro-item will be rendered as a menu item

**ro-float-menu[icon]** Icon attribute is the main menu icon

**ro-float-menu[iconActive]** iconAtive is what will showed after you click in a menu.

**ro-item[text]** Is a item text, if you don't need internationalization just add the description here, if so, use i18n and i18nKey to set up the translation info

 **ro-item[action]** Is the function that will be triggered when user tap a menu item
 
## Roads functions

### templateEngine()

Roads template engine combine any string with pattern {{}} and the data passed as argument.

	var template = '<div>{{desctiption}}</div>';
	Ro.templateEngine (template, {
		description: 'Hello!'
	});
	
You salso can use more complex data.

	var template = '<div>{{user.info.ssn}}</div>';
	var user = {
	   name: 'Jonh Smith',
	   job: 'Front end developer',
	   info: {
	      ssn: 433-433-111
	   }
	}
	Ro.templateEngine (template, user);
	

### styleGenerator()

Sometimes developers need to change a large number of styles in a same DOM element, talking about performance, this may be slow if this element is already rendered. Style Generator will create a css Text and you can use it to change all styles at the same time.

	var e = document.createElement('div');

	e.style.cssText = Ro.styleGenerator({
		border: '1px solid red',
		color: 'red',
		'font-size': '12px'
	});

### Ro.Filter

Filters are functions that will be used to evaluate the value when templateEngine() is replacing data in a template string. Roads come with some basic filters but is also easy create and use new ones.

#### Date
Is used to format date values

	var template = '{{date | date}}';
	var renderedTemplate = Ro.templateEngine(template, {
		date: new Date('2015-06-25T01:05:55.973Z')
	});
	
	>> "06/25/2015"
	
Roads will get Ro.i18n.defaults.date as default, if you want to use another pattern you can change Ro.i18n.defaults.date and you will have a new default value for your app, but you also can pass a new date format as a parameter

	var template = '{{date | date:dd/MM/yyyy}}';
	var renderedTemplate = Ro.templateEngine(template, {
		date: new Date('2015-06-25T01:05:55.973Z')
	});
	
	>> "25/06/2015"

### Ro.i18n

i18n is a internationalization and localization layer you can use to change your app translation and to format your data between different patterns. i18n is nothing more than a specific templateEngine filter.

You should storage all your translations keys at Ro.i18n.translations object.

	Ro.i18n.translations['hello.world'] = 'Olá Mundo!';
	var template = '<h1>{{hello.world | i18n}}</h1>';
	var renderedTemplate = Ro.templateEngine(template);
	
	>> "<h1>Olá Mundo!</h1>"
		
Also is possible translate tag attributes

	<ro-title i18n i18nKey="{{views.headers.myView | i18n}}"></ro-title>	
	
When you use a attribute i18n roads will get the attribute i18nKey, tranlated and will add as a innerHTML of this tag

	        <ro-input type="text" 
                  i18n="placeholder"
                  i18nKey="{{views.form.userName | i18n}}">
                  
When you need translate a specific attribute set the value of i18n attribute with the attribute name you want translate, in previus example, Roads will get i18nKey, translate it and after that will the a new attribute placeholder with translated text.