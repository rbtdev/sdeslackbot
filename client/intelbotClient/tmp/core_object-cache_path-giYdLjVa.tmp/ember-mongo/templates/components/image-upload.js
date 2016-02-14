define('ember-mongo/templates/components/image-upload', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","partial",["partials/spinner"],[],["loc",[null,[5,6],[5,36]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 6
              },
              "end": {
                "line": 19,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/image-upload.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"id","upload-trigger");
            dom.setAttribute(el1,"class","btn primary");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3,"class","icon-camera");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            Upload photo\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("br");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("small");
            var el4 = dom.createTextNode("(under 500k)");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
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
              "line": 8,
              "column": 4
            },
            "end": {
              "line": 20,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","unless",[["get","isUploading",["loc",[null,[9,16],[9,27]]]]],[],0,null,["loc",[null,[9,6],[19,17]]]]
        ],
        locals: [],
        templates: [child0]
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
              "column": 4
            },
            "end": {
              "line": 24,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"id","not-supported");
          var el2 = dom.createTextNode("\n        Please open CoachLogix in Chrome, Firefox, Safari or IE10+ to upload images.\n      ");
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
            "line": 29,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/image-upload.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"id","image-upload-component");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","uploader");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","file");
        dom.setAttribute(el2,"id","file-upload");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
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
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element1, 'class');
        morphs[1] = dom.createMorphAt(element1,1,1);
        morphs[2] = dom.createMorphAt(element1,3,3);
        morphs[3] = dom.createMorphAt(element0,5,5);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",[["subexpr","if",[["get","isUploading",[]],"uploading",""],[],[]]]]],
        ["block","if",[["get","isUploading",["loc",[null,[4,10],[4,21]]]]],[],0,null,["loc",[null,[4,4],[6,11]]]],
        ["block","if",[["get","fileUploadSupported",["loc",[null,[8,10],[8,29]]]]],[],1,2,["loc",[null,[8,4],[24,11]]]],
        ["content","yield",["loc",[null,[27,2],[27,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});