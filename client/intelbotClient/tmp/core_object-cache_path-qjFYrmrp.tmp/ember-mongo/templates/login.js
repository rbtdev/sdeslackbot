define('ember-mongo/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 14
            },
            "end": {
              "line": 22,
              "column": 42
            }
          },
          "moduleName": "ember-mongo/templates/login.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Sign Up");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/login.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-3 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","login-box");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","columns");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        var el6 = dom.createTextNode("\n           ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n           ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("input");
        dom.setAttribute(el8,"type","submit");
        dom.setAttribute(el8,"class","expand button");
        dom.setAttribute(el8,"value","Log In");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1, 1, 1, 1, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3, 1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [5, 3]),1,1);
        return morphs;
      },
      statements: [
        ["element","action",["authenticate"],["on","submit"],["loc",[null,[6,14],[6,51]]]],
        ["inline","input",[],["name","email","placeholder","email","value",["subexpr","@mut",[["get","identification",["loc",[null,[9,61],[9,75]]]]],[],[]]],["loc",[null,[9,12],[9,77]]]],
        ["inline","input",[],["name","password","placeholder","password","type","password","value",["subexpr","@mut",[["get","password",["loc",[null,[14,81],[14,89]]]]],[],[]]],["loc",[null,[14,12],[14,91]]]],
        ["block","link-to",["signup"],[],0,null,["loc",[null,[22,14],[22,54]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});