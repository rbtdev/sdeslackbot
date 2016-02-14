export default Ember.HTMLBars.template((function() {
  var child0 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 8,
            "column": 6
          },
          "end": {
            "line": 10,
            "column": 6
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("      	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("img");
        dom.setAttribute(el1,"src","http://zurb.com/stickers/images/intro-foundation.png");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
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
  var child1 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 18,
            "column": 19
          },
          "end": {
            "line": 18,
            "column": 43
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("Home");
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
  var child2 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 21,
            "column": 19
          },
          "end": {
            "line": 21,
            "column": 44
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("About");
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
  var child3 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 24,
            "column": 19
          },
          "end": {
            "line": 24,
            "column": 48
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("Contact");
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
  var child4 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 27,
            "column": 6
          },
          "end": {
            "line": 30,
            "column": 6
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("        ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","");
        var el2 = dom.createElement("a");
        var el3 = dom.createTextNode("Logout");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n        ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","divider");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [1, 0]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element1);
        return morphs;
      },
      statements: [
        ["element","action",["logout"],[],["loc",[null,[28,24],[28,43]]]]
      ],
      locals: [],
      templates: []
    };
  }());
  var child5 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 30,
            "column": 6
          },
          "end": {
            "line": 33,
            "column": 6
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("        ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","");
        var el2 = dom.createElement("a");
        var el3 = dom.createTextNode("Login");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n        ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","divider");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1, 0]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [
        ["element","action",["login"],[],["loc",[null,[31,24],[31,42]]]]
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
          "line": 48,
          "column": 0
        }
      },
      "moduleName": "ember-mongo/templates/application.hbs"
    },
    arity: 0,
    cachedFragment: null,
    hasRendered: false,
    buildFragment: function buildFragment(dom) {
      var el0 = dom.createDocumentFragment();
      var el1 = dom.createElement("link");
      dom.setAttribute(el1,"href","http://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.css");
      dom.setAttribute(el1,"rel","stylesheet");
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("\n\n");
      dom.appendChild(el0, el1);
      var el1 = dom.createElement("nav");
      dom.setAttribute(el1,"class","top-bar");
      dom.setAttribute(el1,"data-topbar","");
      dom.setAttribute(el1,"role","navigation");
      var el2 = dom.createTextNode("\n  ");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("ul");
      dom.setAttribute(el2,"class","title-area");
      var el3 = dom.createTextNode("\n    \n    ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("li");
      var el4 = dom.createTextNode("\n    ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("div");
      dom.setAttribute(el4,"class","logo");
      var el5 = dom.createTextNode("\n");
      dom.appendChild(el4, el5);
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      var el5 = dom.createTextNode("    ");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n    ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n  ");
      dom.appendChild(el2, el3);
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n\n  ");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("section");
      dom.setAttribute(el2,"class","top-bar-section");
      var el3 = dom.createTextNode("\n    ");
      dom.appendChild(el2, el3);
      var el3 = dom.createComment(" Right Nav Section ");
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n    ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("ul");
      dom.setAttribute(el3,"class","right");
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","");
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","divider");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      \n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","");
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","divider");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      \n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","");
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      dom.setAttribute(el4,"class","divider");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n\n");
      dom.appendChild(el3, el4);
      var el4 = dom.createComment("");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("    ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n    ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("ul");
      dom.setAttribute(el3,"class","social-icons");
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      var el5 = dom.createElement("a");
      dom.setAttribute(el5,"href","");
      var el6 = dom.createElement("i");
      dom.setAttribute(el6,"class","fi-telephone");
      dom.appendChild(el5, el6);
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      var el5 = dom.createElement("a");
      dom.setAttribute(el5,"href","");
      var el6 = dom.createElement("i");
      dom.setAttribute(el6,"class","fi-social-linkedin");
      dom.appendChild(el5, el6);
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      var el5 = dom.createElement("a");
      dom.setAttribute(el5,"href","");
      var el6 = dom.createElement("i");
      dom.setAttribute(el6,"class","fi-social-twitter");
      dom.appendChild(el5, el6);
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n      ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("li");
      var el5 = dom.createElement("a");
      dom.setAttribute(el5,"href","");
      var el6 = dom.createElement("i");
      dom.setAttribute(el6,"class","fi-social-facebook");
      dom.appendChild(el5, el6);
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n    ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n    \n  ");
      dom.appendChild(el2, el3);
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n");
      dom.appendChild(el1, el2);
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("\n\n");
      dom.appendChild(el0, el1);
      var el1 = dom.createElement("div");
      var el2 = dom.createTextNode("\n");
      dom.appendChild(el1, el2);
      var el2 = dom.createComment("");
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n");
      dom.appendChild(el1, el2);
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("\n");
      dom.appendChild(el0, el1);
      return el0;
    },
    buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
      var element2 = dom.childAt(fragment, [2]);
      var element3 = dom.childAt(element2, [3, 3]);
      var morphs = new Array(6);
      morphs[0] = dom.createMorphAt(dom.childAt(element2, [1, 1, 1]),1,1);
      morphs[1] = dom.createMorphAt(dom.childAt(element3, [1]),0,0);
      morphs[2] = dom.createMorphAt(dom.childAt(element3, [5]),0,0);
      morphs[3] = dom.createMorphAt(dom.childAt(element3, [9]),0,0);
      morphs[4] = dom.createMorphAt(element3,13,13);
      morphs[5] = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
      return morphs;
    },
    statements: [
      ["block","link-to",["index"],[],0,null,["loc",[null,[8,6],[10,18]]]],
      ["block","link-to",["index"],[],1,null,["loc",[null,[18,19],[18,55]]]],
      ["block","link-to",["about"],[],2,null,["loc",[null,[21,19],[21,56]]]],
      ["block","link-to",["contact"],[],3,null,["loc",[null,[24,19],[24,60]]]],
      ["block","if",[["get","session.isAuthenticated",["loc",[null,[27,12],[27,35]]]]],[],4,5,["loc",[null,[27,6],[33,13]]]],
      ["content","outlet",["loc",[null,[46,0],[46,10]]]]
    ],
    locals: [],
    templates: [child0, child1, child2, child3, child4, child5]
  };
}()));