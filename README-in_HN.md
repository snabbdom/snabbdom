<img alt="Snabbdom" src="readme-title.svg" width="356px">

सरलता, प्रतिरूपकता, शक्तिशाली सुविधाओं और प्रदर्शन पर ध्यान देने वाली एक वर्चुअल DOM लाइब्रेरी।

---

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/snabbdom/snabbdom/actions/workflows/test.yml/badge.svg)](https://github.com/snabbdom/snabbdom/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/snabbdom.svg)](https://badge.fury.io/js/snabbdom)
[![npm downloads](https://img.shields.io/npm/dm/snabbdom.svg)](https://www.npmjs.com/package/snabbdom)
[![Join the chat at https://gitter.im/snabbdom/snabbdom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/snabbdom/snabbdom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![हमारे सामूहिक को दान करें](https://opencollective.com/snabbdom/donate/button@2x.png?color=blue)](https://opencollective.com/snabbdom#section-contribute)

पहुंच प्रदान करने के लिए [Browserstack](https://www.browserstack.com/) को धन्यवाद
उनके महान क्रॉस-ब्राउज़र परीक्षण उपकरण।

---

Hindi | [简体中文](./README-zh_CN.md) | [English](./README.md)

## परिचय

वर्चुअल डोम अद्भुत है. यह हमें अपने एप्लिकेशन के दृष्टिकोण को व्यक्त करने की अनुमति देता है
अपने राज्य के एक कार्य के रूप में। लेकिन मौजूदा समाधान भी बहुत अच्छे थे
फूला हुआ, बहुत धीमा, सुविधाओं का अभाव, एपीआई OOP के प्रति पक्षपाती था
और/या मेरे लिए आवश्यक सुविधाओं का अभाव है।

स्नैबडोम में अत्यंत सरल, निष्पादन योग्य और एक्स्टेंसिबल शामिल है
कोर जो केवल ≈ 200 SLOC है। यह एक मॉड्यूलर आर्किटेक्चर प्रदान करता है
कस्टम मॉड्यूल के माध्यम से एक्सटेंशन के लिए समृद्ध कार्यक्षमता। रखने के लिए
मूल सरल, सभी गैर-आवश्यक कार्यक्षमता मॉड्यूल को सौंपी गई है।

आप स्नैबडोम को अपनी इच्छानुसार ढाल सकते हैं! चुनें, चुनें और
अपनी इच्छित कार्यक्षमता को अनुकूलित करें। वैकल्पिक रूप से आप बस उपयोग कर सकते हैं
डिफ़ॉल्ट एक्सटेंशन और उच्च के साथ एक वर्चुअल DOM लाइब्रेरी प्राप्त करें
प्रदर्शन, छोटा आकार और नीचे सूचीबद्ध सभी सुविधाएँ।

## विशेषताएँ

- सब से महत्वपूर्ण विशेषता
  - लगभग 200 एसएलओसी - आप आसानी से संपूर्ण कोर और पूरी तरह से पढ़ सकते हैं
    समझें कि यह कैसे काम करता है.
  - मॉड्यूल के माध्यम से विस्तार योग्य।
  - मॉड्यूल के लिए प्रति वीनोड और विश्व स्तर पर हुक का एक समृद्ध सेट उपलब्ध है,
    अंतर और पैच प्रक्रिया के किसी भी भाग में शामिल होने के लिए।
  - शानदार प्रदर्शन. स्नैबडॉम सबसे तेज़ वर्चुअल DOM लाइब्रेरीज़ में से एक है।
  - रिड्यूस/स्कैन के समतुल्य फ़ंक्शन हस्ताक्षर के साथ पैच फ़ंक्शन
    समारोह। एफआरपी लाइब्रेरी के साथ आसान एकीकरण की अनुमति देता है।
- मॉड्यूल में सुविधाएँ
  - आसानी से वर्चुअल DOM नोड बनाने के लिए `h` फ़ंक्शन।
  - [SVG _just works_ with the `h` helper](#svg)।
  - जटिल सीएसएस एनिमेशन करने की सुविधाएँ।
  - शक्तिशाली घटना श्रोता कार्यक्षमता।
  - [Thunks](#thunks) अंतर और पैच प्रक्रिया को और भी अधिक अनुकूलित करने के लिए।
  - [JSX support, including TypeScript types](#jsx)
- तृतीय पक्ष सुविधाएँ
  - सर्वर-साइड HTML आउटपुट [snabbdom-to-html](https://github.com/acstll/snabbdom-to-html) द्वारा प्रदान किया जाता है।
  - [snabbdom-helpers](https://github.com/krainboltgreene/snabbdom-helpers) के साथ कॉम्पैक्ट वर्चुअल DOM निर्माण।
  - [snabby](https://github.com/jamen/snabby) का उपयोग करके टेम्पलेट स्ट्रिंग समर्थन।
  - [snabbdom-looks-like](https://github.com/jvanbruegge/snabbdom-looks-लाइक) के साथ वर्चुअल डोम अभिकथन

## उदाहरण

```mjs
import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h
} from "snabbdom";

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule // attaches event listeners
]);

const container = document.getElementById("container");

const vnode = h(
  "div#container.two.classes",
  { on: { click: () => console.log("div clicked") } },
  [
    h("span", { style: { fontWeight: "bold" } }, "This is bold"),
    " and this is just normal text",
    h("a", { props: { href: "/foo" } }, "I'll take you places!")
  ]
);
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);

const newVnode = h(
  "div#container.two.classes",
  { on: { click: () => console.log("updated div clicked") } },
  [
    h(
      "span",
      { style: { fontWeight: "normal", fontStyle: "italic" } },
      "This is now italic type"
    ),
    " and this is still just normal text",
    h("a", { props: { href: "/bar" } }, "I'll take you places!")
  ]
);
// Second `patch` invocation
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
```

## अधिक उदाहरण

- [Animated reordering of elements](http://snabbdom.github.io/snabbdom/examples/reorder-animation/)
- [Hero transitions](http://snabbdom.github.io/snabbdom/examples/hero/)
- [SVG Carousel](http://snabbdom.github.io/snabbdom/examples/carousel-svg/)

---

## विषयसूची

- [Core documentation](#core-documentation)
  - [`init`](#init)
  - [`patch`](#patch)
    - [Unmounting](#unmounting)
  - [`h`](#h)
  - [`fragment`](#fragment-experimental) (experimental)
  - [`tovnode`](#tovnode)
  - [Hooks](#hooks)
    - [Overview](#overview)
    - [Usage](#usage)
    - [The `init` hook](#the-init-hook)
    - [The `insert` hook](#the-insert-hook)
    - [The `remove` hook](#the-remove-hook)
    - [The `destroy` hook](#the-destroy-hook)
  - [Creating modules](#creating-modules)
- [Modules documentation](#modules-documentation)
  - [The class module](#the-class-module)
  - [The props module](#the-props-module)
  - [The attributes module](#the-attributes-module)
  - [The dataset module](#the-dataset-module)
  - [The style module](#the-style-module)
    - [Custom properties (CSS variables)](#custom-properties-css-variables)
    - [Delayed properties](#delayed-properties)
    - [Set properties on `remove`](#set-properties-on-remove)
    - [Set properties on `destroy`](#set-properties-on-destroy)
  - [The eventlisteners module](#the-eventlisteners-module)
- [SVG](#svg)
  - [Classes in SVG Elements](#classes-in-svg-elements)
- [Thunks](#thunks)
- [JSX](#jsx)
  - [TypeScript](#typescript)
  - [Babel](#babel)
- [Virtual Node](#virtual-node)
  - [sel : String](#sel--string)
  - [data : Object](#data--object)
  - [children : Array<vnode>](#children--arrayvnode)
  - [text : string](#text--string)
  - [elm : Element](#elm--element)
  - [key : string | number](#key--string--number)
- [Structuring applications](#structuring-applications)
- [Common errors](#common-errors)
- [Opportunity for community feedback](#opportunity-for-community-feedback)

## मूल दस्तावेज़ीकरण

स्नैबडॉम का मूल केवल सबसे आवश्यक कार्यक्षमता प्रदान करता है।
इसे तेज़ होने के साथ-साथ यथासंभव सरल बनाने के लिए डिज़ाइन किया गया है
विस्तार योग्य.

### `init`

कोर केवल एक एकल फ़ंक्शन `init` को उजागर करता है। यह `init`
मॉड्यूल की एक सूची लेता है और एक `patch` फ़ंक्शन लौटाता है जो इसका उपयोग करता है
मॉड्यूल का निर्दिष्ट सेट।

```mjs
import { classModule, styleModule } from "snabbdom";

const patch = init([classModule, styleModule]);
```

### `patch`

`init` द्वारा लौटाया गया `patch` फ़ंक्शन दो तर्क लेता है। पहला
एक DOM तत्व या एक vnode है जो वर्तमान दृश्य का प्रतिनिधित्व करता है। दूसरा
एक vnode नए, अद्यतन दृश्य का प्रतिनिधित्व करता है।

यदि पैरेंट वाला DOM तत्व पास हो जाता है, तो `newVnode` चालू हो जाएगा
एक DOM नोड में, और पारित तत्व को प्रतिस्थापित कर दिया जाएगा
DOM नोड बनाया गया. यदि कोई पुराना vnode पारित किया जाता है, तो Snabbdom कुशलतापूर्वक पारित हो जाएगा
नए vnode में विवरण से मेल खाने के लिए इसे संशोधित करें।

पास किया गया कोई भी पुराना वीनोड पिछली कॉल का परिणामी वीनोड होना चाहिए
`patch` करने के लिए. यह आवश्यक है क्योंकि स्नैबडॉम जानकारी संग्रहीत करता है
vnode. इससे सरल और अधिक कार्यान्वित करना संभव हो जाता है
निष्पादक वास्तुकला. इससे नये पुराने के निर्माण से भी बचा जा सकता है
व्नोड वृक्ष.

```mjs
patch(oldVnode, newVnode);
```

#### `अनमाउंट`

हालाँकि इसके माउंट पॉइंट तत्व से VNode ट्री को हटाने के लिए विशेष रूप से कोई API नहीं है, इसे लगभग प्राप्त करने का एक तरीका `patch` के दूसरे तर्क के रूप में एक टिप्पणी VNode प्रदान करना है, जैसे:

```mjs
patch(
  oldVnode,
  h("!", {
    hooks: {
      post: () => {
        /* patch complete */
      }
    }
  })
);
```

निःसंदेह, माउंट बिंदु पर अभी भी एक टिप्पणी नोड है।

### `h`

यह अनुशंसा की जाती है कि आप vnodes बनाने के लिए `h` का उपयोग करें। यह एक स्वीकार करता है
एक स्ट्रिंग के रूप में टैग/चयनकर्ता, एक वैकल्पिक डेटा ऑब्जेक्ट और एक वैकल्पिक स्ट्रिंग या बच्चों की सरणी।

```mjs
import { h } from "snabbdom";

const vnode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph")
]);
```

### `fragment` (प्रयोगात्मक)

सावधानी: यह सुविधा अभी प्रायोगिक है और इसे शामिल किया जाना चाहिए।
इसके एपीआई को बिना किसी बड़े संस्करण के बदलाव के बदला जा सकता है।

```mjs
const patch = init(modules, undefined, {
  experimental: {
    fragments: true
  }
});
```

एक वर्चुअल नोड बनाता है जिसे दिए गए बच्चों वाले दस्तावेज़ खंड में परिवर्तित किया जाएगा।

```mjs
import { fragment, h } from "snabbdom";

const vnode = fragment(["I am", h("span", [" a", " fragment"])]);
```

### `tovnode`

DOM नोड को वर्चुअल नोड में परिवर्तित करता है। पहले से मौजूद, सर्वर-साइड जेनरेट की गई सामग्री पर पैचिंग के लिए विशेष रूप से अच्छा है।

```mjs
import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
  toVNode
} from "snabbdom";

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule // attaches event listeners
]);

const newVNode = h("div", { style: { color: "#000" } }, [
  h("h1", "Headline"),
  h("p", "A paragraph")
]);

patch(toVNode(document.querySelector(".container")), newVNode);
```

### Hooks (हुक्स)

हुक DOM नोड्स के जीवनचक्र से जुड़ने का एक तरीका है। छीना-झपटी
हुक का एक समृद्ध चयन प्रदान करता है। हुक का उपयोग मॉड्यूल द्वारा दोनों के लिए किया जाता है
Snabbdom का विस्तार करें, और सामान्य कोड में मनमाना कोड निष्पादित करने के लिए
वर्चुअल नोड के जीवन में वांछित बिंदु।

#### Overview

| Name        | Triggered when                                              | Arguments to callback   |
| ----------- | ----------------------------------------------------------- | ----------------------- |
| `pre`       | पैच प्रक्रिया शुरू होती है                                  | none                    |
| `init`      | एक vnode जोड़ा गया है                                       | `vnode`                 |
| `create`    | Vnode के आधार पर एक DOM तत्व(element) बनाया गया है          | `emptyVnode, vnode`     |
| `insert`    | DOM में एक तत्व डाला गया है                                 | `vnode`                 |
| `prepatch`  | एक तत्व पैच होने वाला है                                    | `oldVnode, vnode`       |
| `update`    | एक तत्व अद्यतन किया जा रहा है                               | `oldVnode, vnode`       |
| `postpatch` | एक तत्व को पैच कर दिया गया है                               | `oldVnode, vnode`       |
| `destroy`   | किसी तत्व को प्रत्यक्ष या अप्रत्यक्ष रूप से हटाया जा रहा है | `vnode`                 |
| `remove`    | एक तत्व को सीधे DOM से हटाया जा रहा है                      | `vnode, removeCallback` |
| `post`      | पैच प्रक्रिया पूरी हो गई है                                 | none                    |

मॉड्यूल के लिए निम्नलिखित हुक उपलब्ध हैं: `pre`, `create`,
`update`, `destroy`, `remove`, `post`।

निम्नलिखित हुक व्यक्ति की `hook` संपत्ति में उपलब्ध हैं
तत्व: `init`, `create`, `insert`, `prepatch`, `update`,
`postpatch`, `destroy`, `remove`।

#### Usage (प्रयोग)

हुक का उपयोग करने के लिए, उन्हें डेटा के `hook` फ़ील्ड में एक ऑब्जेक्ट के रूप में पास करें
वस्तु तर्क.

```mjs
h("div.row", {
  key: movie.rank,
  hook: {
    insert: (vnode) => {
      movie.elmHeight = vnode.elm.offsetHeight;
    }
  }
});
```

#### The `init` hook (`init` हुक)

यह हुक पैच प्रक्रिया के दौरान लागू किया जाता है जब एक नया वर्चुअल नोड होता है
मिल गया है। Snabbdom द्वारा नोड को किसी भी तरह से संसाधित करने से पहले हुक को कॉल किया जाता है। यानी, इससे पहले इसने vnode के आधार पर एक DOM नोड बनाया है।

#### The `insert` hook (`insert` हुक)

एक बार vnode के लिए DOM तत्व हो जाने के बाद यह हुक लागू हो जाता है
दस्तावेज़ में डाला गया _और_ शेष पैच चक्र पूरा हो गया है।
इसका मतलब है कि आप DOM मापन (जैसे उपयोग करना) कर सकते हैं
[getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
इस हुक में सुरक्षित रूप से, यह जानते हुए कि कोई भी तत्व नहीं बदला जाएगा
बाद में यह सम्मिलित तत्वों की स्थिति को प्रभावित कर सकता है।

#### The `remove` hook (`remove` हुक)

आपको किसी तत्व को हटाने में शामिल होने की अनुमति देता है। हुक कहा जाता है
एक बार एक vnode को DOM से हटाया जाना है। हैंडलिंग फ़ंक्शन
vnode और कॉलबैक दोनों प्राप्त करता है। आप इसे नियंत्रित और विलंबित कर सकते हैं
कॉलबैक के साथ हटाना. कॉलबैक एक बार लागू किया जाना चाहिए
हुक ने अपना काम पूरा कर लिया है, और तत्व केवल हटा दिया जाएगा
एक बार सभी `remove` हुक ने अपना कॉलबैक लागू कर दिया।

हुक केवल तभी चालू होता है जब किसी तत्व को उससे हटाया जाना हो
अभिभावक - यदि यह हटाए गए तत्व का बच्चा है तो नहीं। के लिए
वह, `destroy` हुक देखें।

#### The `destroy` hook (`destroy` हुक)

यह हुक वर्चुअल नोड पर तब लागू होता है जब इसका DOM तत्व हटा दिया जाता है
DOM से या यदि उसके पैरेंट को DOM से हटाया जा रहा है।

इस हुक और `remove` हुक के बीच अंतर देखने के लिए,
एक उदाहरण पर विचार करें.

```mjs
const vnode1 = h("div", [h("div", [h("span", "Hello")])]);
const vnode2 = h("div", []);
patch(container, vnode1);
patch(vnode1, vnode2);
```

यहां `नष्ट` को आंतरिक `div` तत्व _और_ दोनों के लिए ट्रिगर किया गया है
इसमें `span` तत्व शामिल है। दूसरी ओर, 'हटाएं' ही है
`div` तत्व पर ट्रिगर किया गया क्योंकि यह एकमात्र तत्व है
अपने माता-पिता से अलग हो गया।

उदाहरण के लिए, आप किसी एनीमेशन को ट्रिगर करने के लिए `remove` का उपयोग कर सकते हैं
तत्व को हटाया जा रहा है और अतिरिक्त रूप से `destroy` हुक का उपयोग करें
हटाए गए तत्व के बच्चों के गायब होने को चेतन करें।

### Creating modules (मॉड्यूल बनाना)

मॉड्यूल [hooks](#hooks) के लिए वैश्विक श्रोताओं को पंजीकृत करके काम करता है। एक मॉड्यूल बस एक शब्दकोश है जो कार्यों के लिए हुक नामों को मैप करता है।

```mjs
const myModule = {
  create: (oldVnode, vnode) => {
    // invoked whenever a new virtual node is created
  },
  update: (oldVnode, vnode) => {
    // invoked whenever a virtual node is updated
  }
};
```

इस तंत्र से आप आसानी से स्नैबडॉम के व्यवहार को बढ़ा सकते हैं।
प्रदर्शन के लिए, डिफ़ॉल्ट के कार्यान्वयन पर एक नज़र डालें
मॉड्यूल.

## Modules documentation (मॉड्यूल दस्तावेज़ीकरण)

यह मुख्य मॉड्यूल का वर्णन करता है। सभी मॉड्यूल वैकल्पिक हैं. JSX उदाहरण मानते हैं कि आप इस लाइब्रेरी द्वारा प्रदान किए गए [`jsx` pragma](#jsx) का उपयोग कर रहे हैं।

### The class module (क्लास मॉड्यूल)

क्लास मॉड्यूल तत्वों पर कक्षाओं को गतिशील रूप से टॉगल करने का एक आसान तरीका प्रदान करता है। यह `class` डेटा प्रॉपर्टी में एक ऑब्जेक्ट की अपेक्षा करता है।

ऑब्जेक्ट को क्लास नामों को बूलियन में मैप करना चाहिए जो इंगित करता है कि या
क्लास को वीनोड पर रुकना या जाना नहीं चाहिए।

```mjs
h("a", { class: { active: true, selected: false } }, "Toggle");
```

In JSX, you can use `class` like this:

```jsx
<div class={{ foo: true, bar: true }} />
// Renders as: <div class="foo bar"></div>
```

### The props module (प्रॉप्स मॉड्यूल)

Allows you to set properties on DOM elements.

```mjs
h("a", { props: { href: "/foo" } }, "Go to Foo");
```

In JSX, you can use `props` like this:

```jsx
<input props={{ name: "foo" }} />
// Renders as: <input name="foo" /> with input.name === "foo"
```

गुण केवल सेट किए जा सकते हैं, हटाए नहीं जा सकते. भले ही ब्राउज़र कस्टम गुणों को जोड़ने और हटाने की अनुमति देते हैं, यह मॉड्यूल हटाने का प्रयास नहीं करेगा।
यह समझ में आता है क्योंकि मूल DOM गुणों को हटाया नहीं जा सकता। और यदि आप DOM पर मूल्यों को संग्रहीत करने या ऑब्जेक्ट को संदर्भित करने के लिए कस्टम गुणों का उपयोग कर रहे हैं, तो कृपया उपयोग करने पर विचार करें
[data-\* attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
बजाय। शायद [the dataset module](#the-dataset-module) के माध्यम से।

### The attributes module (गुण मॉड्यूल)

प्रॉप्स के समान, लेकिन DOM तत्वों पर गुणों के बजाय विशेषताएँ सेट करें।

```mjs
h("a", { attrs: { href: "/foo" } }, "Go to Foo");
```

In JSX, you can use `attrs` like this:

```jsx
<div attrs={{ "aria-label": "I'm a div" }} />
// Renders as: <div aria-label="I'm a div"></div>
```

विशेषताएँ `setAttribute` का उपयोग करके जोड़ी और अद्यतन की जाती हैं। एक के मामले में
वह विशेषता जो पहले जोड़ी/सेट की गई थी और अब मौजूद नहीं है
`attrs` ऑब्जेक्ट में, इसे DOM तत्व की विशेषता से हटा दिया जाता है
`removeAttribute` का उपयोग करके सूची बनाएं।

बूलियन विशेषताओं के मामले में (उदाहरण के लिए `disabled`, `hidden`,
`selected` ...), अर्थ विशेषता मान पर निर्भर नहीं करता है
('सही' या 'गलत') लेकिन इसके बजाय की उपस्थिति/अनुपस्थिति पर निर्भर करता है
DOM तत्व में स्वयं को विशेषता दें। उन विशेषताओं को संभाला जाता है
मॉड्यूल द्वारा अलग-अलग: यदि एक बूलियन विशेषता को सेट किया गया है
[falsy value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
('0', '-0', 'शून्य', 'गलत', 'NaN', 'अपरिभाषित', या खाली स्ट्रिंग
(`````)), तो विशेषता को विशेषता सूची से हटा दिया जाएगा
DOM तत्व.

### The dataset module (डेटासेट मॉड्यूल)

आपको DOM तत्वों पर कस्टम डेटा विशेषताएँ (`data-*`) सेट करने की अनुमति देता है। फिर इन्हें [HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) प्रॉपर्टी से एक्सेस किया जा सकता है।

```mjs
h("button", { dataset: { action: "reset" } }, "Reset");
```

In JSX, you can use `dataset` like this:

```jsx
<div dataset={{ foo: "bar" }} />
// Renders as: <div data-foo="bar"></div>
```

### The style module (स्टाइल मॉड्यूल)

स्टाइल मॉड्यूल आपके HTML को आकर्षक और सुचारू रूप से जीवंत बनाने के लिए है। पर
इसका मूल यह आपको तत्वों पर सीएसएस गुण सेट करने की अनुमति देता है।

```mjs
h(
  "span",
  {
    style: {
      border: "1px solid #bada55",
      color: "#c0ffee",
      fontWeight: "bold"
    }
  },
  "Say my name, and every colour illuminates"
);
```

In JSX, you can use `style` like this:

```jsx
<div
  style={{
    border: "1px solid #bada55",
    color: "#c0ffee",
    fontWeight: "bold"
  }}
/>
// Renders as: <div style="border: 1px solid #bada55; color: #c0ffee; font-weight: bold"></div>
```

#### Custom properties (कस्टम गुण) (CSS variables)

सीएसएस कस्टम गुण (उर्फ सीएसएस चर) समर्थित हैं, उन्हें उपसर्ग किया जाना चाहिए
`--` के साथ

```mjs
h(
  "div",
  {
    style: { "--warnColor": "yellow" }
  },
  "Warning"
);
```

#### Delayed properties (विलंबित गुण)

आप संपत्तियों को विलंबित होने के रूप में निर्दिष्ट कर सकते हैं। जब भी ये गुण बदलते हैं, तो परिवर्तन अगले फ़्रेम के बाद तक लागू नहीं होता है।

```mjs
h(
  "span",
  {
    style: {
      opacity: "0",
      transition: "opacity 1s",
      delayed: { opacity: "1" }
    }
  },
  "Imma fade right in!"
);
```

इससे तत्वों की प्रविष्टि को घोषणात्मक रूप से एनिमेट करना आसान हो जाता है।

`transition-property` का `all` मान समर्थित नहीं है।

#### गुणों को `remove` पर सेट करें

`remove` गुण में सेट की गई शैलियाँ तत्व के समाप्त होते ही प्रभावी हो जाएंगी
DOM से हटाया जाने वाला है. लागू शैलियाँ होनी चाहिए
सीएसएस बदलावों के साथ एनिमेटेड। केवल एक बार सभी शैलियाँ पूरी हो जाती हैं
एनिमेट करने पर तत्व DOM से हटा दिया जाएगा।

```mjs
h(
  "span",
  {
    style: {
      opacity: "1",
      transition: "opacity 1s",
      remove: { opacity: "0" }
    }
  },
  "It's better to fade out than to burn away"
);
```

This makes it easy to declaratively animate the removal of elements.
इससे तत्वों को हटाने को घोषणात्मक रूप से एनिमेट करना आसान हो जाता है।

`transition-property` का `all` मान समर्थित नहीं है।

#### गुणों को `destroy` पर सेट करें

```mjs
h(
  "span",
  {
    style: {
      opacity: "1",
      transition: "opacity 1s",
      destroy: { opacity: "0" }
    }
  },
  "It's better to fade out than to burn away"
);
```

`transition-property` का `all` मान समर्थित नहीं है।

### इवेंटलिस्टर्स मॉड्यूल

इवेंट श्रोता मॉड्यूल संलग्न करने के लिए शक्तिशाली क्षमताएं देता है
घटना श्रोता.

आप एक आपूर्ति करके vnode पर किसी ईवेंट में एक फ़ंक्शन संलग्न कर सकते हैं
इवेंट के नाम के अनुरूप गुण के साथ `on` पर ऑब्जेक्ट
आप सुनना चाहते हैं. इवेंट होने पर फ़ंक्शन बुलाया जाएगा
होता है और उस ईवेंट ऑब्जेक्ट को पास कर दिया जाएगा जो उससे संबंधित है।

```mjs
function clickHandler(ev) {
  console.log("got clicked");
}
h("div", { on: { click: clickHandler } });
```

In JSX, you can use `on` like this:

```js
<div on={{ click: clickHandler }} />
```

Snabbdom रेंडरर्स के बीच ईवेंट हैंडलर की अदला-बदली की अनुमति देता है। ऐसा बिना होता है
वास्तव में DOM से जुड़े इवेंट हैंडलर को छूना।

हालाँकि, ध्यान दें कि **ईवेंट साझा करते समय आपको सावधान रहना चाहिए
इस मॉड्यूल द्वारा उपयोग की जाने वाली तकनीक के कारण, vnodes** के बीच हैंडलर
ईवेंट हैंडलर को DOM से पुनः बाइंडिंग से बचने के लिए। (और सामान्य तौर पर,
Vnodes के बीच डेटा साझा करना काम करने की गारंटी नहीं है, क्योंकि मॉड्यूल
दिए गए डेटा को बदलने की अनुमति है)।

In particular, you should **not** do something like this:

```mjs
// Does not work
const sharedHandler = {
  change: (e) => {
    console.log("you chose: " + e.target.value);
  }
};
h("div", [
  h("input", {
    props: { type: "radio", name: "test", value: "0" },
    on: sharedHandler
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "1" },
    on: sharedHandler
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "2" },
    on: sharedHandler
  })
]);
```

ऐसे कई मामलों के लिए, आप इसके बजाय सरणी-आधारित हैंडलर का उपयोग कर सकते हैं (ऊपर वर्णित)।
वैकल्पिक रूप से, बस यह सुनिश्चित करें कि प्रत्येक नोड को अद्वितीय `on` मान पारित किया गया है:

```mjs
// Works
const sharedHandler = (e) => {
  console.log("you chose: " + e.target.value);
};
h("div", [
  h("input", {
    props: { type: "radio", name: "test", value: "0" },
    on: { change: sharedHandler }
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "1" },
    on: { change: sharedHandler }
  }),
  h("input", {
    props: { type: "radio", name: "test", value: "2" },
    on: { change: sharedHandler }
  })
]);
```

## SVG

वर्चुअल बनाने के लिए `h` फ़ंक्शन का उपयोग करते समय एसवीजी बस काम करता है
नोड्स एसवीजी तत्व स्वचालित रूप से उपयुक्त के साथ बनाए जाते हैं
नामस्थान.

```mjs
const vnode = h("div", [
  h("svg", { attrs: { width: 100, height: 100 } }, [
    h("circle", {
      attrs: {
        cx: 50,
        cy: 50,
        r: 40,
        stroke: "green",
        "stroke-width": 4,
        fill: "yellow"
      }
    })
  ])
]);
```

[SVG example](./examples/svg) और [SVG Carousel example](./examples/carousel-svg/) भी देखें।

### SVG तत्वों में Classes

कुछ ब्राउज़र (जैसे IE &lt;=11) [SVG तत्वों में `classList` प्रॉपर्टी का समर्थन नहीं करते](http://caniuse.com/#feat=classlist)।
क्योंकि _class_ मॉड्यूल आंतरिक रूप से `classList` का उपयोग करता है, यह इस मामले में तब तक काम नहीं करेगा जब तक कि आप [classList polyfill](https://www.npmjs.com/package/classlist-polyfill) का उपयोग नहीं करते।
(यदि आप पॉलीफ़िल का उपयोग नहीं करना चाहते हैं, तो आप _attributes_ मॉड्यूल के साथ `क्लास' विशेषता का उपयोग कर सकते हैं)।

## Thunks

`thunk` फ़ंक्शन एक चयनकर्ता लेता है, एक थंक की पहचान करने के लिए एक कुंजी,
एक फ़ंक्शन जो एक vnode और स्थिति की एक परिवर्तनीय मात्रा लौटाता है
पैरामीटर. यदि लागू किया जाता है, तो रेंडर फ़ंक्शन राज्य प्राप्त करेगा
तर्क.

`thunk(selector, key, renderFn, [stateArguments])`

`renderFn` को केवल तभी लागू किया जाता है जब `renderFn` को बदल दिया जाता है या `[stateArguments]` सरणी की लंबाई या उसके तत्वों को बदल दिया जाता है।

`key` वैकल्पिक है. इसकी आपूर्ति तब की जानी चाहिए जब `selector` हो
थंक्स भाई-बहनों के बीच अद्वितीय नहीं। यह सुनिश्चित करता है कि थंक है
अंतर करते समय हमेशा सही ढंग से मेल खाता है।

थंक्स एक अनुकूलन रणनीति है जिसका उपयोग तब किया जा सकता है जब कोई हो
अपरिवर्तनीय डेटा से निपटना।

किसी संख्या के आधार पर वर्चुअल नोड बनाने के लिए एक सरल फ़ंक्शन पर विचार करें।

```mjs
function numberView(n) {
  return h("div", "Number is: " + n);
}
```

दृश्य केवल `n` पर निर्भर करता है। इसका मतलब यह है कि यदि `n` अपरिवर्तित है,
फिर वर्चुअल DOM नोड बनाना और उसे पुराने के विरुद्ध पैच करना
vnode बेकार है. ओवरहेड से बचने के लिए हम `thunk` सहायक का उपयोग कर सकते हैं
समारोह।

```mjs
function render(state) {
  return thunk("num", numberView, [state.number]);
}
```

वास्तव में `numberView` फ़ंक्शन को लागू करने के बजाय यह केवल होगा
वर्चुअल ट्री में एक डमी वीनोड रखें। जब स्नैबडॉम इसे पैच करता है
पिछले vnode के विरुद्ध डमी vnode, यह के मूल्य की तुलना करेगा
`n`. यदि `n` अपरिवर्तित है तो यह पुराने vnode का पुन: उपयोग करेगा। यह
संख्या दृश्य और भिन्न प्रक्रिया को पूरी तरह से दोबारा बनाने से बचा जाता है।

यहां व्यू फ़ंक्शन केवल एक उदाहरण है। व्यवहार में थंक्स ही होते हैं
यदि आप एक जटिल दृश्य प्रस्तुत कर रहे हैं तो यह प्रासंगिक है
उत्पन्न करने के लिए महत्वपूर्ण कम्प्यूटेशनल समय।

## JSX

ध्यान दें कि JSX टुकड़े अभी भी प्रयोगात्मक हैं और इन्हें चुना जाना चाहिए।
विवरण के लिए [`fragment`](#fragment-experimental) अनुभाग देखें।

### TypeScript

अपने `tsconfig.json` में निम्नलिखित विकल्प जोड़ें:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "jsx",
    "jsxFragmentFactory": "Fragment"
  }
}
```

फिर सुनिश्चित करें कि आप `.tsx` फ़ाइल एक्सटेंशन का उपयोग करें और फ़ाइल के शीर्ष पर `jsx` फ़ंक्शन और `Fragment` फ़ंक्शन आयात करें:

```tsx
import { Fragment, jsx, VNode } from "snabbdom";

const node: VNode = (
  <div>
    <span>I was created with JSX</span>
  </div>
);

const fragment: VNode = (
  <>
    <span>JSX fragments</span>
    are experimentally supported
  </>
);
```

### Babel

अपने बेबल कॉन्फ़िगरेशन में निम्नलिखित विकल्प जोड़ें:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "jsx",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}
```

फिर फ़ाइल के शीर्ष पर `jsx` फ़ंक्शन और `Fragment` फ़ंक्शन आयात करें:

```jsx
import { Fragment, jsx } from "snabbdom";

const node = (
  <div>
    <span>I was created with JSX</span>
  </div>
);

const fragment = (
  <>
    <span>JSX fragments</span>
    are experimentally supported
  </>
);
```

## Virtual Node

**गुण**

- [sel](#sel--string)
- [data](#data--object)
- [children](#children--array)
- [text](#text--string)
- [elm](#elm--element)
- [key](#key--string--number)

### sel : String

वर्चुअल नोड की `.sel` संपत्ति सीएसएस चयनकर्ता को दी जाती है
[`h()`](#snabbdomh) निर्माण के दौरान। उदाहरण के लिए: `h('div#container', {}, [...])` एक वर्चुअल नोड बनाएगा जिसमें `div#container` होगा
इसकी `.sel` संपत्ति।

### data : Object

वर्चुअल नोड की `.data` प्रॉपर्टी जानकारी जोड़ने का स्थान है
[modules](#modules-documentation) तक पहुंचने और हेरफेर करने के लिए
वास्तविक DOM तत्व जब इसे बनाया जाता है; शैलियाँ, सीएसएस कक्षाएं जोड़ें,
गुण, आदि

डेटा ऑब्जेक्ट [`h()`](#snabbdomh) का (वैकल्पिक) दूसरा पैरामीटर है

उदाहरण के लिए `h('div', {props: {className: 'container'}}, [...])` एक वर्चुअल नोड तैयार करेगा

```mjs
({
  props: {
    className: "container"
  }
});
```

as its `.data` object.

### children : Array<vnode>

वर्चुअल नोड की `.children` संपत्ति तीसरी (वैकल्पिक) है
निर्माण के दौरान [`h()`](#snabbdomh) का पैरामीटर। `.children` है
बस आभासी नोड्स की एक सरणी जिसे बच्चों के रूप में जोड़ा जाना चाहिए
निर्माण पर मूल DOM नोड।

उदाहरण के लिए `h('div', {}, [ h('h1', {}, 'Hello, World') ])` होगा
के साथ एक वर्चुअल नोड बनाएं

```mjs
[
  {
    sel: "h1",
    data: {},
    children: undefined,
    text: "Hello, World",
    elm: Element,
    key: undefined
  }
];
```

as its `.children` property.

### text : string

`.text` प्रॉपर्टी तब बनाई जाती है जब एक वर्चुअल नोड बनाया जाता है
केवल एक ही बच्चा जिसके पास पाठ है और केवल उसकी आवश्यकता है
`document.createTextNode()` का उपयोग किया जाना है।

उदाहरण के लिए: `h('h1', {}, 'Hello')` एक वर्चुअल नोड बनाएगा
`हैलो` इसकी `.text` संपत्ति के रूप में।

### elm : Element

वर्चुअल नोड की `.elm` संपत्ति वास्तविक DOM का सूचक है
स्नैबडोम द्वारा बनाया गया नोड। यह संपत्ति करने में बहुत उपयोगी है
[hooks](#hooks) में गणना के साथ-साथ
[modules](#modules-documentation).।

### key : string | number

`.key` प्रॉपर्टी तब बनती है जब आपके अंदर एक कुंजी प्रदान की जाती है
[`.data`](#data--object) ऑब्जेक्ट। `.key` प्रॉपर्टी का उपयोग रखने के लिए किया जाता है
DOM नोड्स की ओर संकेत जो पहले से मौजूद थे ताकि उन्हें दोबारा बनाने से बचा जा सके
यदि यह अनावश्यक है. यह सूची जैसी चीजों के लिए बहुत उपयोगी है
पुन: व्यवस्थित करना। अनुमति देने के लिए कुंजी या तो एक स्ट्रिंग या एक संख्या होनी चाहिए
उचित लुकअप क्योंकि इसे आंतरिक रूप से कुंजी/मूल्य जोड़ी के रूप में संग्रहीत किया जाता है
एक ऑब्जेक्ट, जहां `.key` कुंजी है और मान है
[`.elm`](#elm--element) संपत्ति बनाई गई।

यदि प्रदान किया गया है, तो `.key` संपत्ति सहोदर तत्वों के बीच अद्वितीय होनी चाहिए।

उदाहरण के लिए: `h('div', {key: 1}, [])` एक वर्चुअल नोड बनाएगा
`.key` गुण वाली वस्तु जिसका मान `1` है।

## अनुप्रयोगों की संरचना करना

स्नैबडॉम एक निम्न-स्तरीय वर्चुअल DOM लाइब्रेरी है। इसके साथ कोई राय नहीं है आपको अपने आवेदन की संरचना किस प्रकार करनी चाहिए इसके संबंध में।

यहां स्नैबडॉम के साथ एप्लिकेशन बनाने के कुछ दृष्टिकोण दिए गए हैं।

- [functional-frontend-architecture](https://github.com/paldepind/functional-frontend-architecture) –
  एक भंडार जिसमें कई उदाहरण अनुप्रयोग शामिल हैं
  एक ऐसी वास्तुकला को प्रदर्शित करता है जो स्नैबडॉम का उपयोग करती है।
- [Cycle.js](https://cycle.js.org/) –
  "क्लीनर कोड के लिए एक कार्यात्मक और प्रतिक्रियाशील जावास्क्रिप्ट ढांचा"
  स्नैबडोम का उपयोग करता है
- [Vue.js](http://vuejs.org/) use a fork of snabbdom.
- [scheme-todomvc](https://github.com/amirouche/scheme-todomvc/) स्नैबडॉम बाइंडिंग के शीर्ष पर रिडक्स-जैसी वास्तुकला का निर्माण करें।
- [kaiju](https://github.com/AlexGalays/kaiju) -
  स्नैबडॉम के शीर्ष पर स्टेटफुल घटक और अवलोकन
- [Tweed](https://tweedjs.github.io) –
  प्रतिक्रियाशील इंटरफेस के लिए एक ऑब्जेक्ट ओरिएंटेड दृष्टिकोण।
- [Cyclow](http://cyclow.js.org) -
  "जावास्क्रिप्ट के लिए एक प्रतिक्रियाशील फ्रंटएंड ढांचा"
  स्नैबडोम का उपयोग करता है
- [Tung](https://github.com/Reon90/tung) –
  HTML प्रस्तुत करने के लिए एक जावास्क्रिप्ट लाइब्रेरी। तुंग एचटीएमएल और जावास्क्रिप्ट विकास को विभाजित करने में मदद करता है।
- [sprotty](https://github.com/theia-ide/sprotty) - "एक वेब-आधारित आरेखण ढाँचा" स्नैबडॉम का उपयोग करता है।
- [Mark Text](https://github.com/marktext/marktext) - "रियलटाइम प्रीव्यू मार्कडाउन एडिटर" स्नैबडॉम पर निर्मित है।
- [puddles](https://github.com/flintinatux/puddles) - "छोटा वीडोम ऐप फ्रेमवर्क। शुद्ध रिडक्स। कोई बॉयलरप्लेट नहीं।" - दिल से निर्मित: स्नैबडॉम पर।
- [Backbone.VDOMView](https://github.com/jcbrand/backbone.vdomview) - A [Backbone](http://backbonejs.org/) स्नैबडॉम के माध्यम से वर्चुअलडोम क्षमता के साथ देखें।
- [Rosmaro Snabbdom starter](https://github.com/lukaszmakuch/rosmaro-snabbdom-starter) - राज्य मशीनों और स्नैबडोम के साथ यूजर इंटरफेस का निर्माण।
- [Pureact](https://github.com/irony/pureact) - "रिएक्ट का 65 लाइनों का कार्यान्वयन जिसमें केवल एक निर्भरता के साथ Redux और हुक शामिल हैं - Snabbdom"
- [Snabberb](https://github.com/tobymao/snabberb) - प्रतिक्रियाशील विचारों के निर्माण के लिए [Opal](https://github.com/opal/opal) और स्नैबडोम का उपयोग करते हुए एक न्यूनतम रूबी ढांचा।
- [WebCell](https://github.com/EasyWebApp/WebCell) - JSX और TypeScript पर आधारित वेब कंपोनेंट इंजन

यदि आप किसी अन्य तरीके से एप्लिकेशन बना रहे हैं तो इसे साझा करना सुनिश्चित करें
स्नैबडोम का उपयोग करना।

## आम त्रुटियों

```text
Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node':
    The node before which the new node is to be inserted is not a child of this node.
```

इस त्रुटि का कारण पैच के बीच वीनोड्स का पुन: उपयोग करना है (कोड उदाहरण देखें), स्नैबडॉम प्रदर्शन में सुधार के रूप में पास किए गए वर्चुअल डोम नोड्स के अंदर वास्तविक डोम नोड्स को संग्रहीत करता है, इसलिए पैच के बीच नोड्स का पुन: उपयोग समर्थित नहीं है।

```mjs
const sharedNode = h("div", {}, "Selected");
const vnode1 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, ["Two"]),
  h("div", {}, [sharedNode])
]);
const vnode2 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, [sharedNode]),
  h("div", {}, ["Three"])
]);
patch(container, vnode1);
patch(vnode1, vnode2);
```

आप ऑब्जेक्ट की एक उथली प्रतिलिपि बनाकर इस समस्या को ठीक कर सकते हैं (यहां ऑब्जेक्ट स्प्रेड सिंटैक्स के साथ):

```mjs
const vnode2 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, [{ ...sharedNode }]),
  h("div", {}, ["Three"])
]);
```

एक अन्य समाधान फ़ैक्टरी फ़ंक्शन में साझा vnodes को लपेटना होगा:

```mjs
const sharedNode = () => h("div", {}, "Selected");
const vnode1 = h("div", [
  h("div", {}, ["One"]),
  h("div", {}, ["Two"]),
  h("div", {}, [sharedNode()])
]);
```

## सामुदायिक प्रतिक्रिया का अवसर

पुल अनुरोध, जिन पर समुदाय प्रतिक्रिया देने में रुचि रखता है, उन्हें कुछ दिनों का अवसर प्रदान किए जाने के बाद विलय कर दिया जाना चाहिए।
