export default Ember.HTMLBars.template((function() {
  var child0 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 7,
            "column": 3
          },
          "end": {
            "line": 11,
            "column": 3
          }
        },
        "moduleName": "ember-mongo/templates/login.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("		  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n		  	Unable to login, please try again\n		  ");
        dom.appendChild(el1, el2);
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
          "line": 14,
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
      dom.setAttribute(el1,"id","login");
      dom.setAttribute(el1,"class","row");
      var el2 = dom.createTextNode("\n	");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("form");
      dom.setAttribute(el2,"class","column");
      var el3 = dom.createTextNode("\n	  ");
      dom.appendChild(el2, el3);
      var el3 = dom.createComment("");
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n	  ");
      dom.appendChild(el2, el3);
      var el3 = dom.createComment("");
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n	  ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("button");
      dom.setAttribute(el3,"type","submit");
      var el4 = dom.createTextNode("Login");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n");
      dom.appendChild(el2, el3);
      var el3 = dom.createComment("");
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("	");
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
      var element0 = dom.childAt(fragment, [1, 1]);
      var morphs = new Array(4);
      morphs[0] = dom.createElementMorph(element0);
      morphs[1] = dom.createMorphAt(element0,1,1);
      morphs[2] = dom.createMorphAt(element0,3,3);
      morphs[3] = dom.createMorphAt(element0,7,7);
      return morphs;
    },
    statements: [
      ["element","action",["authenticate"],["on","submit"],["loc",[null,[3,24],[3,61]]]],
      ["inline","input",[],["id","email","placeholder","Enter email","value",["subexpr","@mut",[["get","identification",["loc",[null,[4,54],[4,68]]]]],[],[]]],["loc",[null,[4,3],[4,70]]]],
      ["inline","input",[],["id","password","placeholder","Enter password","type","password","value",["subexpr","@mut",[["get","password",["loc",[null,[5,76],[5,84]]]]],[],[]]],["loc",[null,[5,3],[5,86]]]],
      ["block","if",[["get","authError",["loc",[null,[7,9],[7,18]]]]],[],0,null,["loc",[null,[7,3],[11,10]]]]
    ],
    locals: [],
    templates: [child0]
  };
}()));