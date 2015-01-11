
describe('Template engine tests', function () {

    it('Should replace string', function () {
        
        var template = '{{id}}';
        var renderedTemplate = Ro.templateEngine (template, {
            id: 'hello!'
        });

        expect(renderedTemplate).toBe('hello!');

    });

});