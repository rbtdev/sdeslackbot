export default Ember.HTMLBars.template((function() {
  var child0 = (function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 9
            },
            "end": {
              "line": 8,
              "column": 8
            }
          },
          "moduleName": "ember-mongo/templates/profile.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				    	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"syle","float:left");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element1, 'src');
          return morphs;
        },
        statements: [
          ["attribute","src",["get","session.currentUser.avatar",["loc",[null,[7,50],[7,76]]]]]
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
              "line": 8,
              "column": 8
            },
            "end": {
              "line": 10,
              "column": 9
            }
          },
          "moduleName": "ember-mongo/templates/profile.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				         ");
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
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 4,
            "column": 7
          },
          "end": {
            "line": 13,
            "column": 5
          }
        },
        "moduleName": "ember-mongo/templates/profile.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("	  		  	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("				");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n		      	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("input");
        dom.setAttribute(el1,"type","file");
        dom.setAttribute(el1,"id","file-upload");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [1]);
        var morphs = new Array(2);
        morphs[0] = dom.createElementMorph(element2);
        morphs[1] = dom.createMorphAt(element2,1,1);
        return morphs;
      },
      statements: [
        ["element","action",["triggerFileSelection"],[],["loc",[null,[5,13],[5,46]]]],
        ["block","if",[["get","session.currentUser.avatar",["loc",[null,[6,15],[6,41]]]]],[],0,1,["loc",[null,[6,9],[10,16]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }());
  var child1 = (function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 16,
            "column": 7
          },
          "end": {
            "line": 20,
            "column": 5
          }
        },
        "moduleName": "ember-mongo/templates/profile.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("			    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","progress");
        var el2 = dom.createTextNode("\n			      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","bar");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n			    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1, 1]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'style');
        return morphs;
      },
      statements: [
        ["attribute","style",["get","progress",["loc",[null,[18,44],[18,52]]]]]
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
            "line": 20,
            "column": 5
          },
          "end": {
            "line": 22,
            "column": 5
          }
        },
        "moduleName": "ember-mongo/templates/profile.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("			    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        var el2 = dom.createTextNode("uploading...");
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
          "line": 40,
          "column": 0
        }
      },
      "moduleName": "ember-mongo/templates/profile.hbs"
    },
    arity: 0,
    cachedFragment: null,
    hasRendered: false,
    buildFragment: function buildFragment(dom) {
      var el0 = dom.createDocumentFragment();
      var el1 = dom.createElement("div");
      dom.setAttribute(el1,"id","profile");
      dom.setAttribute(el1,"class","row centered");
      var el2 = dom.createTextNode("\n		");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("div");
      dom.setAttribute(el2,"class","column small-6 medium-4 large-3");
      var el3 = dom.createTextNode("\n			");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      dom.setAttribute(el3,"id","upload-trigger");
      var el4 = dom.createTextNode("\n");
      dom.appendChild(el3, el4);
      var el4 = dom.createComment("");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("  			");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n  			");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      var el4 = dom.createTextNode("\n");
      dom.appendChild(el3, el4);
      var el4 = dom.createComment("");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("			 ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n		");
      dom.appendChild(el2, el3);
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n		");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("div");
      dom.setAttribute(el2,"class","column small-6 medium-8 large-9");
      var el3 = dom.createTextNode("\n			");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      dom.setAttribute(el3,"class","row");
      var el4 = dom.createTextNode("\n				");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("div");
      dom.setAttribute(el4,"class","column");
      var el5 = dom.createTextNode("\n					Name ");
      dom.appendChild(el4, el5);
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      var el5 = dom.createTextNode("\n				");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n			");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n			");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      dom.setAttribute(el3,"class","row");
      var el4 = dom.createTextNode("\n				");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("div");
      dom.setAttribute(el4,"class","column");
      var el5 = dom.createTextNode("\n					Email ");
      dom.appendChild(el4, el5);
      var el5 = dom.createComment("");
      dom.appendChild(el4, el5);
      var el5 = dom.createTextNode("\n				");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n			");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("		\n		");
      dom.appendChild(el2, el3);
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n	\n	");
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
      var element3 = dom.childAt(fragment, [0]);
      var element4 = dom.childAt(element3, [1]);
      var element5 = dom.childAt(element3, [3]);
      var morphs = new Array(5);
      morphs[0] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
      morphs[1] = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
      morphs[2] = dom.createMorphAt(dom.childAt(element5, [1, 1]),1,1);
      morphs[3] = dom.createMorphAt(dom.childAt(element5, [3, 1]),1,1);
      morphs[4] = dom.createMorphAt(element3,5,5);
      return morphs;
    },
    statements: [
      ["block","file-uploader",[],["isDisabled",["subexpr","@mut",[["get","controller.isUploading",["loc",[null,[4,35],[4,57]]]]],[],[]],"fileInputChanged","receiveFile","uploadProgress","uploadProgress"],0,null,["loc",[null,[4,7],[13,23]]]],
      ["block","if",[["get","isUploading",["loc",[null,[16,13],[16,24]]]]],[],1,2,["loc",[null,[16,7],[22,12]]]],
      ["inline","input",[],["placeholder","Name","type","text","value",["subexpr","@mut",[["get","model.name",["loc",[null,[28,61],[28,71]]]]],[],[]]],["loc",[null,[28,10],[28,73]]]],
      ["inline","input",[],["placeholder","email","type","text","value",["subexpr","@mut",[["get","model.email",["loc",[null,[33,63],[33,74]]]]],[],[]]],["loc",[null,[33,11],[33,76]]]],
      ["content","outlet",["loc",[null,[38,1],[38,11]]]]
    ],
    locals: [],
    templates: [child0, child1, child2]
  };
}()));