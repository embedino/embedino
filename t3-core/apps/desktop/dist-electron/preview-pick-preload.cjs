let electron = require("electron");
//#region ../../node_modules/.pnpm/react-grab@0.1.50_react@19.2.6/node_modules/react-grab/dist/freeze-updates-BuDA4bqJ.js
/**
* @license MIT
*
* Copyright (c) 2025 Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
let e = null;
const t = () => {
	if (e !== null) return e;
	try {
		e = window.matchMedia(`(color-gamut: p3)`).matches;
	} catch {
		e = !1;
	}
	return e;
}, n = t(), r = (e) => n ? `color(display-p3 0.84 0.19 0.78 / ${e})` : `rgba(210, 57, 192, ${e})`, u = [
	`/components/ui/`,
	`/packages/ui/`,
	`/design-system/`,
	`/design-systems/`,
	`/primitives/`
], d = 5e3, f = 8e3, p = 1e4, ee = .5;
r(.4);
r(.05);
r(.5);
r(.08);
r(.15);
const pe$1 = /* @__PURE__ */ new Set([
	`id`,
	`data-testid`,
	`aria-label`,
	`href`,
	`src`,
	`alt`,
	`type`,
	`name`,
	`placeholder`,
	`role`,
	`for`,
	`action`,
	`method`,
	`title`,
	`disabled`,
	`checked`,
	`readonly`,
	`required`,
	`selected`,
	`open`
]), me$1 = /* @__PURE__ */ new Set([
	`a`,
	`code`,
	`pre`
]), he$1 = /* @__PURE__ */ new Set([
	`script`,
	`style`,
	`template`,
	`noscript`
]), ve$1 = `data-react-grab-frozen`, ye$1 = `data-react-grab-same-origin-frame`, Je$1 = new Set(`display.position.top.right.bottom.left.z-index.overflow.overflow-x.overflow-y.width.height.min-width.min-height.max-width.max-height.margin-top.margin-right.margin-bottom.margin-left.padding-top.padding-right.padding-bottom.padding-left.flex-direction.flex-wrap.justify-content.align-items.align-self.align-content.flex-grow.flex-shrink.flex-basis.order.gap.row-gap.column-gap.grid-template-columns.grid-template-rows.grid-template-areas.font-family.font-size.font-weight.font-style.line-height.letter-spacing.text-align.text-decoration-line.text-decoration-style.text-transform.text-overflow.text-shadow.white-space.word-break.overflow-wrap.vertical-align.color.background-color.background-image.background-position.background-size.background-repeat.border-top-width.border-right-width.border-bottom-width.border-left-width.border-top-style.border-right-style.border-bottom-style.border-left-style.border-top-color.border-right-color.border-bottom-color.border-left-color.border-top-left-radius.border-top-right-radius.border-bottom-left-radius.border-bottom-right-radius.box-shadow.opacity.transform.filter.backdrop-filter.object-fit.object-position`.split(`.`)), Ye$1 = (e) => typeof e == `object` && !!e && `nodeType` in e && e.nodeType === Node.ELEMENT_NODE, h = (e) => Ye$1(e) && e.namespaceURI === `http://www.w3.org/1999/xhtml`, g = (e) => h(e) && e.tagName === `IFRAME`, Xe$1 = /* @__PURE__ */ new WeakMap(), _ = (e) => {
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : 0;
}, Ze$1 = (e) => {
	let t = performance.now(), n = Xe$1.get(e);
	if (n && t - n.timestamp < 16) return n.metrics;
	let r = e.ownerDocument.defaultView?.getComputedStyle(e), i;
	if (!r) i = {
		contentOffsetX: e.clientLeft,
		contentOffsetY: e.clientTop,
		height: e.offsetHeight,
		width: e.offsetWidth
	};
	else {
		let t = _(r.borderLeftWidth), n = _(r.borderRightWidth), a = _(r.borderTopWidth), o = _(r.borderBottomWidth), s = _(r.paddingLeft), c = _(r.paddingRight), l = _(r.paddingTop), u = _(r.paddingBottom), d = _(r.width), f = _(r.height), p = t + n + s + c, ee = a + o + l + u, m = r.boxSizing === `border-box` ? d : d + p, te = r.boxSizing === `border-box` ? f : f + ee;
		i = {
			contentOffsetX: t + s,
			contentOffsetY: a + l,
			height: te > 0 ? te : e.offsetHeight,
			width: m > 0 ? m : e.offsetWidth
		};
	}
	return Xe$1.set(e, {
		metrics: i,
		timestamp: t
	}), i;
}, Qe$1 = (e, t) => t > 0 ? e / t : 1, $e$1 = (e) => {
	if (!e) return null;
	try {
		return e.frameElement;
	} catch {
		return null;
	}
}, tt$1 = (e) => {
	let t = e.ownerDocument.defaultView;
	return t ? t.getComputedStyle(e) : window.getComputedStyle(e);
}, it$1 = (e) => Object.assign(e, { [Symbol.dispose]: e }), at$1 = `bippy-0.6.1`, ot$1 = Object.defineProperty, st$1 = Object.prototype.hasOwnProperty, v = () => {}, ct$1 = (e) => {
	try {
		Function.prototype.toString.call(e).indexOf(`^_^`) > -1 && setTimeout(() => {
			throw Error(`React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build`);
		});
	} catch {}
}, lt$1 = (e = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => !!(e && `getFiberRoots` in e);
let ut$1 = !1, dt$1;
const ft$1 = (e = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => ut$1 ? !0 : (e && typeof e.inject == `function` && (dt$1 = e.inject.toString()), !!dt$1?.includes(`(injected)`)), y = /* @__PURE__ */ new Set(), pt$1 = /* @__PURE__ */ new Set(), mt$1 = (e) => {
	e && y.add(e);
	let t = /* @__PURE__ */ new Map(), n = 0, r = {
		_instrumentationIsActive: !1,
		_instrumentationSource: at$1,
		checkDCE: ct$1,
		hasUnsupportedRendererAttached: !1,
		inject(e) {
			let i = ++n;
			return t.set(i, e), pt$1.add(e), r._instrumentationIsActive || (r._instrumentationIsActive = !0, y.forEach((e) => e())), i;
		},
		on: v,
		onCommitFiberRoot: v,
		onCommitFiberUnmount: v,
		onPostCommitFiberRoot: v,
		renderers: t,
		supportsFiber: !0,
		supportsFlight: !0
	};
	try {
		ot$1(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, {
			configurable: !0,
			enumerable: !0,
			get() {
				return r;
			},
			set(t) {
				if (t && typeof t == `object`) {
					let n = r.renderers;
					r = t, n.size > 0 && (n.forEach((e, n) => {
						pt$1.add(e), t.renderers.set(n, e);
					}), ht$1(e));
				}
			}
		});
		let t = window.hasOwnProperty, n = !1;
		ot$1(window, `hasOwnProperty`, {
			configurable: !0,
			value: function(...e) {
				try {
					if (!n && e[0] === `__REACT_DEVTOOLS_GLOBAL_HOOK__`) return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = void 0, n = !0, -0;
				} catch {}
				return t.apply(this, e);
			},
			writable: !0
		});
	} catch {
		ht$1(e);
	}
	return r;
}, ht$1 = (e) => {
	e && y.add(e);
	try {
		let t = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!t) return;
		if (!t._instrumentationSource) {
			t.checkDCE = ct$1, t.supportsFiber = !0, t.supportsFlight = !0, t.hasUnsupportedRendererAttached = !1, t._instrumentationSource = at$1, t._instrumentationIsActive = !1;
			let e = lt$1(t);
			if (e || (t.on = v), t.renderers.size) {
				t._instrumentationIsActive = !0, y.forEach((e) => e());
				return;
			}
			let n = t.inject, r = ft$1(t);
			r && !e && (ut$1 = !0, t.inject({ scheduleRefresh() {} }) && (t._instrumentationIsActive = !0)), t.inject = (e) => {
				let i = n(e);
				return pt$1.add(e), r && t.renderers.set(i, e), t._instrumentationIsActive = !0, y.forEach((e) => e()), i;
			};
		}
		(t.renderers.size || t._instrumentationIsActive || ft$1()) && e?.();
	} catch {}
}, gt$1 = () => st$1.call(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`), b$1 = (e) => gt$1() ? (ht$1(e), globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) : mt$1(e), _t$1 = () => !!(typeof window < `u` && (window.document?.createElement || window.navigator?.product === `ReactNative`));
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
(() => {
	try {
		_t$1() && b$1();
	} catch {}
})();
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
const yt$1 = (e) => {
	switch (e.tag) {
		case 1:
		case 11:
		case 0:
		case 14:
		case 15: return !0;
		default: return !1;
	}
}, bt$1 = (e) => !e || typeof e != `object` ? !1 : `pendingProps` in e && !(`containerInfo` in e), xt$1 = (e) => {
	let t = e.memoizedProps, n = e.alternate?.memoizedProps || {}, r = e.flags ?? e.effectTag ?? 0;
	switch (e.tag) {
		case 1:
		case 9:
		case 11:
		case 0:
		case 14:
		case 15: return (r & 1) == 1;
		default: return e.alternate ? n !== t || e.alternate.memoizedState !== e.memoizedState || e.alternate.ref !== e.ref : !0;
	}
}, St$1 = (e) => {
	switch (e.tag) {
		case 18: return !0;
		case 7:
		case 6:
		case 23:
		case 22: return !0;
		case 3: return !1;
		default: {
			let t = typeof e.type == `object` && e.type !== null ? e.type.$$typeof : e.type;
			if (typeof t == `symbol`) return t.description === `react.concurrent_mode` || t.description === `react.async_mode`;
			switch (t) {
				case 60111:
				case `Symbol(react.concurrent_mode)`:
				case `Symbol(react.async_mode)`: return !0;
				default: return !1;
			}
		}
	}
};
function wt$1(e, t, n = !1) {
	if (!e) return null;
	let r = t(e);
	if (r instanceof Promise) return (async () => {
		if (await r === !0) return e;
		let i = n ? e.return : e.child;
		for (; i;) {
			let e = await Et$1(i, t, n);
			if (e) return e;
			i = n ? null : i.sibling;
		}
		return null;
	})();
	if (r === !0) return e;
	let i = n ? e.return : e.child;
	for (; i;) {
		let e = Tt$1(i, t, n);
		if (e) return e;
		i = n ? null : i.sibling;
	}
	return null;
}
const Tt$1 = (e, t, n = !1) => {
	if (!e) return null;
	if (t(e) === !0) return e;
	let r = n ? e.return : e.child;
	for (; r;) {
		let e = Tt$1(r, t, n);
		if (e) return e;
		r = n ? null : r.sibling;
	}
	return null;
}, Et$1 = async (e, t, n = !1) => {
	if (!e) return null;
	if (await t(e) === !0) return e;
	let r = n ? e.return : e.child;
	for (; r;) {
		let e = await Et$1(r, t, n);
		if (e) return e;
		r = n ? null : r.sibling;
	}
	return null;
}, Dt$1 = (e) => {
	let t = e;
	return typeof t == `function` ? t : typeof t == `object` && t ? Dt$1(t.type || t.render) : null;
}, Ot$1 = (e) => {
	let t = e;
	if (typeof t == `string`) return t;
	if (typeof t != `function` && !(typeof t == `object` && t)) return null;
	let n = t.displayName || t.name || null;
	if (n) return n;
	let r = Dt$1(t);
	return r && (r.displayName || r.name) || null;
}, kt$1 = () => {
	let e = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	return !!e?._instrumentationIsActive || lt$1(e) || ft$1(e);
}, At$1 = /* @__PURE__ */ new Set();
let Mt$1 = 0;
const x$1 = /* @__PURE__ */ new WeakMap(), Nt$1 = (e, t = Mt$1++) => {
	x$1.set(e, t);
}, Pt$1 = (e) => {
	let t = x$1.get(e);
	return t === void 0 && e.alternate && (t = x$1.get(e.alternate)), t === void 0 && (t = Mt$1++, Nt$1(e, t)), t;
}, S$1 = (e, t, n) => {
	let r = t;
	for (; r != null;) {
		if (x$1.has(r) || Pt$1(r), !St$1(r) && xt$1(r) && e(r, `mount`), r.tag === 13) if (r.memoizedState !== null) {
			let t = r.child, n = t ? t.sibling : null;
			if (n) {
				let t = n.child;
				t !== null && S$1(e, t, !1);
			}
		} else {
			let t = null;
			r.child !== null && (t = r.child.child), t !== null && S$1(e, t, !1);
		}
		else r.child != null && S$1(e, r.child, !0);
		r = n ? r.sibling : null;
	}
}, Ft$1 = (e, t, n, r) => {
	if (x$1.has(t) || Pt$1(t), !n) return;
	x$1.has(n) || Pt$1(n);
	let i = t.tag === 13, a = !St$1(t);
	a && xt$1(t) && e(t, `update`);
	let o = i && n.memoizedState !== null, s = i && t.memoizedState !== null;
	if (o && s) {
		let r = t.child?.sibling ?? null, i = n.child?.sibling ?? null;
		r !== null && i !== null && Ft$1(e, r, i, t);
	} else if (o && !s) {
		let n = t.child;
		n !== null && S$1(e, n, !0);
	} else if (!o && s) {
		Lt$1(e, n);
		let r = t.child?.sibling ?? null;
		r !== null && S$1(e, r, !0);
	} else if (t.child !== n.child) {
		let n = t.child;
		for (; n;) {
			if (n.alternate) {
				let i = n.alternate;
				Ft$1(e, n, i, a ? t : r);
			} else S$1(e, n, !1);
			n = n.sibling;
		}
	}
}, It$1 = (e, t) => {
	(t.tag === 3 || !St$1(t)) && e(t, `unmount`);
}, Lt$1 = (e, t) => {
	let n = t.tag === 13 && t.memoizedState !== null, r = t.child;
	for (n && (r = (t.child?.sibling ?? null)?.child ?? null); r !== null;) r.return !== null && (It$1(e, r), Lt$1(e, r)), r = r.sibling;
}, Rt$1 = (e) => {
	if (!gt$1()) return null;
	let t = e;
	for (; t.return;) t = t.return;
	let n = Gt$1.get(t.stateNode);
	return n === void 0 ? null : b$1().renderers?.get(n) ?? null;
}, zt$1 = (e) => Object.prototype.toString.call(e) === `[object Object]` && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null), Bt$1 = (e, t = []) => {
	if (!zt$1(e)) return [{
		path: t,
		value: e
	}];
	let n = [];
	for (let r in e) {
		let i = e[r], a = t.concat(r);
		zt$1(i) ? n.push(...Bt$1(i, a)) : n.push({
			path: a,
			value: i
		});
	}
	return n;
}, Vt$1 = /* @__PURE__ */ new Set(), Ht$1 = /* @__PURE__ */ new Set(), Ut$1 = /* @__PURE__ */ new Set(), Wt$1 = /* @__PURE__ */ new Set(), C$1 = /* @__PURE__ */ new WeakMap(), Gt$1 = /* @__PURE__ */ new WeakMap(), Kt$1 = (e) => {
	let t = C$1.get(e) ?? {};
	if (C$1.set(e, t), !t.onCommitFiberRoot || e.onCommitFiberRoot !== t.onCommitFiberRoot) {
		let n = e.onCommitFiberRoot, r = (t, i, a) => {
			if (n?.(t, i, a), C$1.get(e)?.onCommitFiberRoot === r) {
				At$1.add(i), Gt$1.set(i, t);
				for (let e of Vt$1) e(t, i, a);
			}
		};
		t.onCommitFiberRoot = r, e.onCommitFiberRoot = r;
	}
	if (!t.onCommitFiberUnmount || e.onCommitFiberUnmount !== t.onCommitFiberUnmount) {
		let n = e.onCommitFiberUnmount, r = (t, i) => {
			if (n?.(t, i), C$1.get(e)?.onCommitFiberUnmount === r) for (let e of Ht$1) e(t, i);
		};
		t.onCommitFiberUnmount = r, e.onCommitFiberUnmount = r;
	}
	if (!t.onPostCommitFiberRoot || e.onPostCommitFiberRoot !== t.onPostCommitFiberRoot) {
		let n = e.onPostCommitFiberRoot, r = (t, i) => {
			if (n?.(t, i), C$1.get(e)?.onPostCommitFiberRoot === r) for (let e of Ut$1) e(t, i);
		};
		t.onPostCommitFiberRoot = r, e.onPostCommitFiberRoot = r;
	}
	if (!t.onScheduleFiberRoot || e.onScheduleFiberRoot !== t.onScheduleFiberRoot) {
		let n = e.onScheduleFiberRoot, r = (t, i, a) => {
			if (n?.(t, i, a), C$1.get(e)?.onScheduleFiberRoot === r) for (let e of Wt$1) e(t, i, a);
		};
		t.onScheduleFiberRoot = r, e.onScheduleFiberRoot = r;
	}
}, qt$1 = (e) => {
	let t = b$1(e.onActive);
	t._instrumentationSource = e.name ?? at$1, Kt$1(t);
	let { onActive: n, onCommitFiberRoot: r, onCommitFiberUnmount: i, onPostCommitFiberRoot: a, onScheduleFiberRoot: o } = e;
	return r && Vt$1.add(r), i && Ht$1.add(i), a && Ut$1.add(a), o && Wt$1.add(o), it$1(() => {
		n && y.delete(n), r && Vt$1.delete(r), i && Ht$1.delete(i), a && Ut$1.delete(a), o && Wt$1.delete(o);
	});
}, Jt$1 = /* @__PURE__ */ new Set(), Yt$1 = (e) => e.startsWith(`__reactContainer$`) || e.startsWith(`__reactInternalInstance$`) || e.startsWith(`__reactFiber`), Xt$1 = (e) => {
	let t = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	if (t?.renderers) for (let n of t.renderers.values()) try {
		let t = n.findFiberByHostInstance?.(e);
		if (t) return t;
	} catch {}
	if (typeof e == `object` && e) {
		if (`_reactRootContainer` in e) return e._reactRootContainer?._internalRoot?.current?.child;
		let t = e.__internalInstanceHandle ?? e._internalInstanceHandle;
		if (bt$1(t)) return t;
		let n = e;
		for (let e of Jt$1) {
			let t = n[e];
			if (t) return t;
		}
		for (let e of Object.keys(n)) if (Yt$1(e)) return Jt$1.add(e), n[e] || null;
		for (let t of At$1) {
			if (Rt$1(t.current)?.findFiberByHostInstance) continue;
			let n = wt$1(t.current, (t) => t.stateNode === e);
			if (n) return n;
		}
	}
	return null;
}, Zt$1 = /* @__PURE__ */ new WeakMap(), w$1 = (e) => Zt$1.get(e) ?? null, $t$1 = (e) => w$1(e)?.getFiber() ?? Xt$1(e);
const on$1 = (e) => {
	let t = e.ownerDocument?.defaultView;
	return !!(t && e instanceof t.ShadowRoot);
};
var T$1 = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = `ReactGrabError`;
	}
}, mn$1 = class extends T$1 {
	constructor() {
		super(`Can't generate CSS selector for non-element node type.`), this.name = `NonElementNodeError`;
	}
}, hn$1 = class extends T$1 {
	constructor(e) {
		super(`Timeout: Can't find a unique selector after ${e}ms`), this.name = `SelectorTimeoutError`, this.timeoutMs = e;
	}
}, gn$1 = class extends T$1 {
	constructor() {
		super(`Selector was not found.`), this.name = `SelectorNotFoundError`;
	}
};
const vn$1 = (e) => w$1(e)?.getTagName() ?? (e.tagName || ``).toLowerCase(), Cn$1 = (e) => typeof e == `object` && !!e && `nodeType` in e && e.nodeType === 9, wn$1 = (e) => {
	if (e.assignedSlot) return e.assignedSlot;
	if (e.parentElement) return e.parentElement;
	let t = e.getRootNode();
	return on$1(t) ? t.host : Cn$1(t) ? $e$1(t.defaultView) : null;
};
const On$1 = (e) => {
	return !0;
}, An$1 = typeof window < `u`, jn$1 = (e) => 0, Mn$1 = (e) => {}, D$1 = An$1 ? (Object.getOwnPropertyDescriptor(Window.prototype, `requestAnimationFrame`)?.value ?? window.requestAnimationFrame).bind(window) : jn$1, Nn$1 = An$1 ? (Object.getOwnPropertyDescriptor(Window.prototype, `cancelAnimationFrame`)?.value ?? window.cancelAnimationFrame).bind(window) : Mn$1, O$2 = (e) => {
	try {
		return e.contentDocument;
	} catch {
		return null;
	}
}, Fn$1 = (e, t, n) => {
	let r = e.getBoundingClientRect(), i = Ze$1(e), a = Qe$1(r.width, i.width), o = Qe$1(r.height, i.height);
	return {
		x: (t - r.left) / a - i.contentOffsetX,
		y: (n - r.top) / o - i.contentOffsetY
	};
}, In$1 = (e, t, n) => {
	let r = e.elementFromPoint(t, n);
	for (; r;) {
		let e = r.shadowRoot?.elementFromPoint(t, n);
		if (e && e !== r) {
			r = e;
			continue;
		}
		if (g(r)) {
			let e = O$2(r);
			if (!e) return r;
			let i = Fn$1(r, t, n);
			return In$1(e, i.x, i.y) ?? r;
		}
		return r;
	}
	return null;
}, Rn$1 = (e) => {
	let t = e;
	for (; t;) {
		if (t.hasAttribute(`data-react-grab-ignore`)) return !0;
		t = wn$1(t);
	}
	return !1;
}, zn$1 = typeof Element < `u` && typeof Element.prototype.checkVisibility == `function`, Bn$1 = {
	checkOpacity: !0,
	checkVisibilityCSS: !0,
	opacityProperty: !0,
	visibilityProperty: !0
}, Vn$1 = {
	checkVisibilityCSS: !0,
	visibilityProperty: !0
}, Hn$1 = (e, t) => {
	if (zn$1 && !t) return e.checkVisibility(Bn$1) ? !0 : e.checkVisibility(Vn$1) ? tt$1(e).opacity !== `0` : !1;
	let n = t ?? tt$1(e);
	return n.display !== `none` && n.visibility !== `hidden` && n.opacity !== `0`;
}, Un$1 = (e) => {
	let t = vn$1(e);
	return t === `html` || t === `body`;
}, Wn$1 = [`data-react-grab`, `data-react-grab-demo`], Gn$1 = (e) => Wn$1.some((t) => e.hasAttribute(t)), Kn$1 = (e) => {
	if (Gn$1(e)) return !0;
	let t = e.getRootNode();
	return on$1(t) && Gn$1(t.host);
}, qn$1 = (e) => {
	let t = parseInt(e.zIndex, 10);
	return e.pointerEvents === `none` && e.position === `fixed` && !isNaN(t) && t >= 2147483600;
}, Jn$1 = (e) => {
	let t = e.backgroundColor;
	return t === `transparent` || t === `rgba(0, 0, 0, 0)`;
}, Yn$1 = (e) => {
	let t = e.position;
	if (t !== `fixed` && t !== `absolute`) return !1;
	if (Jn$1(e) || parseFloat(e.opacity) < .1) return !0;
	let n = parseInt(e.zIndex, 10);
	return !isNaN(n) && n > 1e3;
};
let Xn$1 = /* @__PURE__ */ new WeakMap();
const Qn$1 = (e) => {
	let t = w$1(e);
	if (t) return t.isConnected();
	if (Un$1(e) || Kn$1(e) || Rn$1(e)) return !1;
	let n = performance.now(), r = Xn$1.get(e);
	if (r && n - r.timestamp < 50) return r.isVisible;
	if (!Hn$1(e)) return Xn$1.set(e, {
		isVisible: !1,
		timestamp: n
	}), !1;
	if (e.clientWidth / (e.ownerDocument.defaultView?.innerWidth ?? window.innerWidth) >= .9 && e.clientHeight / (e.ownerDocument.defaultView?.innerHeight ?? window.innerHeight) >= .9) {
		let t = tt$1(e);
		if (qn$1(t) || Yn$1(t)) return !1;
	}
	return Xn$1.set(e, {
		isVisible: !0,
		timestamp: n
	}), !0;
}, $n$1 = (e, t, n) => {
	let r = !0;
	for (let i of e.elementsFromPoint(t, n)) {
		if (Rn$1(i) && (r = !1), !On$1(i)) continue;
		let a = i.shadowRoot;
		if (r && a && a !== e) {
			let e = $n$1(a, t, n);
			if (e) return e;
		}
		if (r && g(i)) {
			let e = O$2(i);
			if (e) {
				let r = Fn$1(i, t, n), a = $n$1(e, r.x, r.y);
				if (a) return a;
			}
		}
		if (Qn$1(i)) return i;
	}
	return null;
}, tr$1 = (e, t, n, r) => {
	let i = e.elementsFromPoint(t, n), a = !0;
	for (let o of i) {
		if (Rn$1(o) && (a = !1), a && o.shadowRoot && o.shadowRoot !== e && tr$1(o.shadowRoot, t, n, r), a && g(o)) {
			let e = O$2(o);
			if (e) {
				let i = Fn$1(o, t, n);
				tr$1(e, i.x, i.y, r);
			}
		}
		r.add(o);
	}
};
`${ye$1}`;
const j$2 = /* @__PURE__ */ new WeakMap(), M$2 = (e) => typeof e == `object` && !!e, _r$1 = (e) => typeof e == `object` && !!e || typeof e == `function`, N$2 = (e, t) => typeof e[t] == `function`, yr$1 = (e) => M$2(e) && N$2(e, `clone`) && N$2(e, `premultiply`), Sr$1 = (e) => M$2(e) && e.isObject3D === !0 && typeof e.uuid == `string` && typeof e.name == `string` && typeof e.type == `string` && typeof e.visible == `boolean` && yr$1(e.matrixWorld) && N$2(e, `updateWorldMatrix`), Cr$1 = (e) => M$2(e) && e.isCamera === !0, wr$1 = (e) => Sr$1(e) && e.isScene === !0 && Array.isArray(e.children), Tr$1 = (e) => M$2(e) && typeof e.tagName == `string` && e.tagName.toLowerCase() === `canvas` && N$2(e, `getContext`), Er$1 = (e) => M$2(e) && Tr$1(e.domElement), Dr$1 = (e) => M$2(e) && N$2(e, `set`), Or$1 = (e) => M$2(e) && N$2(e, `setFromCamera`) && N$2(e, `intersectObjects`), kr$1 = (e) => M$2(e) && Er$1(e.gl) && wr$1(e.scene) && Cr$1(e.camera) && Or$1(e.raycaster) && Dr$1(e.pointer), jr$1 = (e) => {
	let t = e.current.stateNode;
	if (!M$2(t) || !_r$1(t.containerInfo)) return null;
	let n = Reflect.get(t.containerInfo, `getState`);
	if (typeof n != `function`) return null;
	let r = n();
	return kr$1(r) ? r : null;
};
qt$1({
	name: `react-grab-three-selection`,
	onCommitFiberRoot: (e, t) => {
		let n = jr$1(t);
		n && j$2.set(n.gl.domElement, {
			isReactThreeFiber: !0,
			state: n
		});
	}
});
const z$2 = /* @__PURE__ */ new Map();
const $r$1 = /* @__PURE__ */ new WeakSet(), B$2 = /* @__PURE__ */ new Map(), V$2 = /* @__PURE__ */ new Map(), ei$1 = (e) => $r$1.has(e) ? !0 : !1;
typeof window < `u` && (window.requestAnimationFrame = (e) => {
	if (!ei$1(e)) return D$1(e);
	return D$1((n) => {
		e(n);
	});
}, window.cancelAnimationFrame = (e) => {
	if (z$2.has(e)) {
		z$2.delete(e);
		return;
	}
	let t = V$2.get(e);
	if (t !== void 0) {
		Nn$1(t.nativeId), V$2.delete(e);
		return;
	}
	let n = B$2.get(e);
	if (n !== void 0) {
		z$2.delete(n), B$2.delete(e);
		return;
	}
	Nn$1(e);
});
`${ve$1}${ve$1}`;
//#endregion
//#region ../../node_modules/.pnpm/react-grab@0.1.50_react@19.2.6/node_modules/react-grab/dist/open-file-BFYiXTGc.js
/**
* @license MIT
*
* Copyright (c) 2025 Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
const ce = /^[a-zA-Z][a-zA-Z\d+\-.]*:/, le = [
	`rsc://`,
	`file:///`,
	`webpack-internal://`,
	`webpack://`,
	`node:`,
	`turbopack://`,
	`metro://`,
	`/app-pages-browser/`,
	`/(app-pages-browser)/`
], ue = [`rsc://`, `about://React/`], de = [
	`<anonymous>`,
	`eval`,
	``
], fe = /\.(jsx|tsx|ts|js)$/, pe = /(\.min|bundle|chunk|vendor|vendors|runtime|polyfill|polyfills)\.(js|mjs|cjs)$|(chunk|bundle|vendor|vendors|runtime|polyfill|polyfills|framework|app|main|index)[-_.][A-Za-z0-9_-]{4,}\.(js|mjs|cjs)$|[\da-f]{8,}\.(js|mjs|cjs)$|[-_.][\da-f]{20,}\.(js|mjs|cjs)$|\/dist\/|\/build\/|\/.next\/|\/out\/|\/node_modules\/|\.webpack\.|\.vite\.|\.turbopack\./i, me = /^\?[\w~.-]+(?:=[^&#]*)?(?:&[\w~.-]+(?:=[^&#]*)?)*$/, he = /\(at [^)]+\)$/, ge = [`react_stack_bottom_frame`, `react-stack-bottom-frame`], _e = /(^|@)\S+:\d+/, ve = /^\s*at .*(\S+:\d+|\(native\))/m, ye = /^(eval@)?(\[native code\])?$/, b = (e, t) => {
	if (t?.includeInElement !== !1) {
		let n = e.split(`
`), r = [];
		for (let e of n) if (/^\s*at\s+/.test(e)) {
			let t = xe(e, void 0)[0];
			t && r.push(t);
		} else if (/^\s*in\s+/.test(e)) {
			let t = e.replace(/^\s*in\s+/, ``).replace(/\s*\(at .*\)$/, ``);
			r.push({
				functionName: t,
				source: e
			});
		} else if (e.match(_e)) {
			let t = Se(e, void 0)[0];
			t && r.push(t);
		}
		return x(r, t);
	}
	return e.match(ve) ? xe(e, t) : Se(e, t);
}, be = (e) => {
	if (!e.includes(`:`)) return [
		e,
		void 0,
		void 0
	];
	let t = e.startsWith(`(`) && /:\d+\)$/.test(e) ? e.slice(1, -1) : e, n = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(t);
	return n ? [
		n[1],
		n[2] || void 0,
		n[3] || void 0
	] : [
		t,
		void 0,
		void 0
	];
}, x = (e, t) => t && t.slice != null ? Array.isArray(t.slice) ? e.slice(t.slice[0], t.slice[1]) : e.slice(0, t.slice) : e, xe = (e, t) => x(e.split(`
`).filter((e) => !!e.match(ve)), t).map((e) => {
	let t = e;
	t.includes(`(eval `) && (t = t.replace(/eval code/g, `eval`).replace(/(\(eval at [^()]*)|(,.*$)/g, ``));
	let n = t.replace(/^\s+/, ``).replace(/\(eval code/g, `(`).replace(/^.*?\s+/, ``), r = n.match(/ (\(.+\)$)/);
	n = r ? n.replace(r[0], ``) : n;
	let i = be(r ? r[1] : n);
	return {
		functionName: r && n || void 0,
		fileName: [`eval`, `<anonymous>`].includes(i[0]) ? void 0 : i[0],
		lineNumber: i[1] ? +i[1] : void 0,
		columnNumber: i[2] ? +i[2] : void 0,
		source: t
	};
}), Se = (e, t) => x(e.split(`
`).filter((e) => !e.match(ye)), t).map((e) => {
	let t = e;
	if (t.includes(` > eval`) && (t = t.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, `:$1`)), !t.includes(`@`) && !t.includes(`:`)) return { functionName: t };
	{
		let e = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/, n = t.match(e), r = n && n[1] ? n[1] : void 0, i = be(t.replace(e, ``));
		return {
			functionName: r,
			fileName: i[0],
			lineNumber: i[1] ? +i[1] : void 0,
			columnNumber: i[2] ? +i[2] : void 0,
			source: t
		};
	}
}), Ce = /* @__PURE__ */ new WeakMap(), we = (e) => ge.some((t) => e.includes(t)), Te = (e) => {
	let t = e.getFunctionName?.() ?? ``;
	if (t) return t;
	let n = e.getTypeName?.() ?? ``, r = e.getMethodName?.() ?? ``;
	return n && r ? `${n}.${r}` : r;
}, Ee = (e) => {
	let t = [];
	for (let n = 1; n < e.length; n++) {
		let r = e[n], i = Te(r);
		if (we(i)) return {
			frames: t,
			isTrusted: !0
		};
		if (r.isNative?.()) {
			t.push({ functionName: i || void 0 });
			continue;
		}
		let a = r.getScriptNameOrSourceURL?.() ?? ``;
		!a && r.isEval?.() && (a = r.getEvalOrigin?.() ?? ``), t.push({
			functionName: i && i !== `<anonymous>` ? i : void 0,
			fileName: a && a !== `<anonymous>` ? a : void 0,
			lineNumber: r.getLineNumber?.() ?? void 0,
			columnNumber: r.getColumnNumber?.() ?? void 0,
			enclosingLineNumber: r.getEnclosingLineNumber?.() ?? void 0,
			enclosingColumnNumber: r.getEnclosingColumnNumber?.() ?? void 0,
			source: `    at ${r.toString()}`
		});
	}
	return {
		frames: t,
		isTrusted: !1
	};
}, De = (e) => {
	let t = -1;
	for (let n of ge) if (t = e.indexOf(n), t !== -1) break;
	return {
		frames: b(t === -1 ? e : e.slice(0, e.lastIndexOf(`
`, t))).slice(1),
		isTrusted: t !== -1
	};
}, S = (e) => {
	let t = Ce.get(e);
	if (t) return t;
	let n = null, r = (e, t) => {
		n = Ee(t);
		let r = `${e.name || `Error`}: ${e.message || ``}`;
		for (let e of t) r += `\n    at ${e.toString()}`;
		return r;
	}, i = Error.prepareStackTrace;
	Error.prepareStackTrace = r;
	let a;
	try {
		a = String(e.stack);
	} finally {
		Error.prepareStackTrace = i;
	}
	let o = n ?? De(a);
	return Ce.set(e, o), o;
};
var Oe = 44, ke = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`, Ae = /* @__PURE__ */ new Uint8Array(64), je = /* @__PURE__ */ new Uint8Array(128);
for (let e = 0; e < ke.length; e++) {
	let t = ke.charCodeAt(e);
	Ae[e] = t, je[t] = e;
}
function C(e, t) {
	let n = 0, r = 0, i = 0;
	do
		i = je[e.next()], n |= (i & 31) << r, r += 5;
	while (i & 32);
	let a = n & 1;
	return n >>>= 1, a && (n = -2147483648 | -n), t + n;
}
function Me(e, t) {
	return e.pos >= t ? !1 : e.peek() !== Oe;
}
var Ne = class {
	constructor(e) {
		this.pos = 0, this.buffer = e;
	}
	next() {
		return this.buffer.charCodeAt(this.pos++);
	}
	peek() {
		return this.buffer.charCodeAt(this.pos);
	}
	indexOf(e) {
		let { buffer: t, pos: n } = this, r = t.indexOf(e, n);
		return r === -1 ? t.length : r;
	}
};
function Pe(e) {
	let { length: t } = e, n = new Ne(e), r = [], i = 0, a = 0, o = 0, s = 0, c = 0;
	do {
		let e = n.indexOf(`;`), t = [], l = !0, u = 0;
		for (i = 0; n.pos < e;) {
			let r;
			i = C(n, i), i < u && (l = !1), u = i, Me(n, e) ? (a = C(n, a), o = C(n, o), s = C(n, s), Me(n, e) ? (c = C(n, c), r = [
				i,
				a,
				o,
				s,
				c
			]) : r = [
				i,
				a,
				o,
				s
			]) : r = [i], t.push(r), n.pos++;
		}
		l || Fe(t), r.push(t), n.pos = e + 1;
	} while (n.pos <= t);
	return r;
}
function Fe(e) {
	e.sort(Ie);
}
function Ie(e, t) {
	return e[0] - t[0];
}
const Le = /^[a-zA-Z][a-zA-Z\d+\-.]*:/, Re = /^data:application\/json[^,]+base64,/, ze = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*(?:\*\/)[ \t]*$)/, Be = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), Ve = (e, t, n, r, i) => {
	if (n < 0 || n >= e.length) return null;
	let a = e[n];
	if (!a || a.length === 0) return null;
	let o = null, s = 0, c = a.length - 1;
	for (; s <= c;) {
		let e = s + c >> 1;
		a[e][0] <= r ? (o = a[e], s = e + 1) : c = e - 1;
	}
	if (!o || o.length < 4) return null;
	let [, l, u, d] = o;
	if (l === void 0 || u === void 0 || d === void 0) return null;
	let f = t[l];
	return f ? {
		columnNumber: d,
		fileName: f,
		lineNumber: u + 1,
		isIgnoreListed: i?.has(l) ?? !1
	} : null;
}, He = (e, t, n) => {
	if (e.sections) {
		let r = t - 1, i = null;
		for (let t of e.sections) if (r > t.offset.line || r === t.offset.line && n >= t.offset.column) i = t;
		else break;
		if (!i) return null;
		let a = r - i.offset.line, o = r === i.offset.line ? n - i.offset.column : n;
		return Ve(i.map.mappings, i.map.sources, a, o, i.map.ignoredSourceIndices);
	}
	return Ve(e.mappings, e.sources, t - 1, n, e.ignoredSourceIndices);
}, Ue = (e, t) => {
	let n, r = t.length;
	for (; r > 0 && !n;) {
		let e = t.lastIndexOf(`
`, r - 1) + 1, i = t.slice(e, r).match(ze);
		i && (n = i[1] || i[2]), r = e - 1;
	}
	if (!n) return null;
	let i = Le.test(n);
	if (!(Re.test(n) || i || n.startsWith(`/`))) {
		let t = e.split(`/`);
		t[t.length - 1] = n, n = t.join(`/`);
	}
	return n;
}, We = (e) => {
	let t = e.ignoreList ?? e.x_google_ignoreList;
	return Array.isArray(t) && t.length > 0 ? new Set(t) : void 0;
}, Ge = (e) => ({
	file: e.file,
	ignoredSourceIndices: We(e),
	mappings: Pe(e.mappings),
	names: e.names,
	sourceRoot: e.sourceRoot,
	sources: e.sources,
	sourcesContent: e.sourcesContent,
	version: 3
}), Ke = (e) => {
	let t = e.sections.map(({ map: e, offset: t }) => ({
		map: {
			...e,
			ignoredSourceIndices: We(e),
			mappings: Pe(e.mappings)
		},
		offset: t
	})), n = /* @__PURE__ */ new Set();
	for (let e of t) for (let t of e.map.sources) n.add(t);
	return {
		file: e.file,
		mappings: [],
		names: [],
		sections: t,
		sourceRoot: void 0,
		sources: Array.from(n),
		sourcesContent: void 0,
		version: 3
	};
}, qe = (e) => {
	if (!e) return !1;
	let t = e.trim();
	if (!t) return !1;
	let n = t.match(Le);
	if (!n) return !0;
	let r = n[0].toLowerCase();
	return r === `http:` || r === `https:`;
}, Je = async (e, t = fetch) => {
	if (!qe(e)) return null;
	let n = await t(e);
	if (!n.ok) return null;
	let r = await n.text();
	if (!r) return null;
	let i = Ue(e, r);
	if (!i || !qe(i) && !Re.test(i)) return null;
	let a = await t(i);
	if (!a.ok) return null;
	try {
		let e = await a.json();
		return `sections` in e ? Ke(e) : Ge(e);
	} catch {
		return null;
	}
}, Ye = async (e, t = !0, n) => {
	if (t && Be.has(e)) return Be.get(e) ?? null;
	let r = t ? w.get(e) : void 0;
	if (r) return (await r).sourceMap;
	let i = Je(e, n).then((e) => ({
		sourceMap: e,
		isTransientFailure: !1
	}), () => ({
		sourceMap: null,
		isTransientFailure: !0
	}));
	t && w.set(e, i);
	let { sourceMap: a, isTransientFailure: o } = await i;
	return t && (w.delete(e), o || Be.set(e, a)), a;
}, T = async (e, t = !0, n) => await Promise.all(e.map(async (e) => {
	if (!e.fileName) return e;
	let r = await Ye(e.fileName, t, n);
	if (!r || typeof e.lineNumber != `number` || typeof e.columnNumber != `number`) return e;
	let i = He(r, e.lineNumber, e.columnNumber);
	return i ? {
		...e,
		source: i.fileName && e.source ? e.source.replace(e.fileName, i.fileName) : e.source,
		fileName: i.fileName,
		lineNumber: i.lineNumber,
		columnNumber: i.columnNumber,
		isIgnoreListed: i.isIgnoreListed,
		isSymbolicated: !0
	} : e;
})), E = (e) => e._debugStack instanceof Error && typeof e._debugStack?.stack == `string`, Xe = (e) => typeof e.tag == `number`, Ze = (e) => e._debugOwner, Qe = (e) => {
	let t = null;
	if (wt$1(e, (n) => {
		if (n === e) return !1;
		let r = n._debugOwner;
		return (r === e || e.alternate !== null && r === e.alternate) && n._debugStack instanceof Error ? (t = n._debugStack, !0) : !1;
	}), !t) return null;
	let { frames: n, isTrusted: r } = S(t);
	if (!r) return null;
	for (let e = n.length - 1; e >= 0; e--) {
		let t = n[e];
		if (t.fileName) return {
			...t,
			lineNumber: t.enclosingLineNumber || t.lineNumber,
			columnNumber: t.enclosingColumnNumber || t.columnNumber
		};
	}
	return null;
}, $e = () => {
	let e = b$1();
	for (let t of [...Array.from(pt$1), ...Array.from(e.renderers.values())]) {
		let e = t.currentDispatcherRef;
		if (e && typeof e == `object`) return `H` in e ? e.H : e.current;
	}
	return null;
}, et = (e) => {
	for (let t of pt$1) {
		let n = t.currentDispatcherRef;
		n && typeof n == `object` && (`H` in n ? n.H = e : n.current = e);
	}
}, D = (e) => `\n    in ${e}`, tt = (e, t) => {
	let n = D(e);
	return t && (n += ` (at ${t})`), n;
};
let O$1 = !1;
const k$1 = /* @__PURE__ */ new WeakMap(), A$1 = (e, t) => {
	if (!e || O$1) return ``;
	let n = k$1.get(e);
	if (n !== void 0) return n;
	let r = Error.prepareStackTrace;
	Error.prepareStackTrace = void 0, O$1 = !0;
	let i = $e();
	et(null);
	let a = console.error, o = console.warn;
	console.error = () => {}, console.warn = () => {};
	try {
		let n = { DetermineComponentFrameRoot() {
			let n;
			try {
				if (t) {
					let t = function() {
						throw Error();
					};
					if (Object.defineProperty(t.prototype, `props`, { set: function() {
						throw Error();
					} }), typeof Reflect == `object` && Reflect.construct) {
						try {
							Reflect.construct(t, []);
						} catch (e) {
							n = e;
						}
						Reflect.construct(e, [], t);
					} else {
						try {
							t.call();
						} catch (e) {
							n = e;
						}
						e.call(t.prototype);
					}
				} else {
					try {
						throw Error();
					} catch (e) {
						n = e;
					}
					let t = e();
					t && typeof t.catch == `function` && t.catch(() => {});
				}
			} catch (e) {
				if (e instanceof Error && n instanceof Error && typeof e.stack == `string`) return [e.stack, n.stack];
			}
			return [null, null];
		} };
		n.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`, Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot, `name`)?.configurable && Object.defineProperty(n.DetermineComponentFrameRoot, `name`, { value: `DetermineComponentFrameRoot` });
		let [r, i] = n.DetermineComponentFrameRoot();
		if (r && i) {
			let t = r.split(`
`), n = i.split(`
`), a = 0, o = 0;
			for (; a < t.length && !t[a].includes(`DetermineComponentFrameRoot`);) a++;
			for (; o < n.length && !n[o].includes(`DetermineComponentFrameRoot`);) o++;
			if (a === t.length || o === n.length) for (a = t.length - 1, o = n.length - 1; a >= 1 && o >= 0 && t[a] !== n[o];) o--;
			for (; a >= 1 && o >= 0; a--, o--) if (t[a] !== n[o]) {
				if (a !== 1 || o !== 1) do
					if (a--, o--, o < 0 || t[a] !== n[o]) {
						let n = `\n${t[a].replace(` at new `, ` at `)}`, r = Ot$1(e);
						return r && n.includes(`<anonymous>`) && (n = n.replace(`<anonymous>`, r)), k$1.set(e, n), n;
					}
				while (a >= 1 && o >= 0);
				break;
			}
		}
	} finally {
		O$1 = !1, Error.prepareStackTrace = r, et(i), console.error = a, console.warn = o;
	}
	let s = e ? Ot$1(e) : ``, c = s ? D(s) : ``;
	return k$1.set(e, c), c;
}, nt = (e, t) => {
	let n = e.tag, r = ``;
	switch (n) {
		case 28:
			r = D(`Activity`);
			break;
		case 1:
			r = A$1(e.type, !0);
			break;
		case 11:
			r = A$1(e.type.render, !1);
			break;
		case 0:
		case 15:
			r = A$1(e.type, !1);
			break;
		case 5:
		case 26:
		case 27:
			r = D(e.type);
			break;
		case 16:
			r = D(`Lazy`);
			break;
		case 13:
			r = e.child !== t && t !== null ? D(`Suspense Fallback`) : D(`Suspense`);
			break;
		case 19:
			r = D(`SuspenseList`);
			break;
		case 30:
			r = D(`ViewTransition`);
			break;
		default: return ``;
	}
	return r;
}, rt = (e) => {
	try {
		let t = ``, n = e, r = null;
		do {
			t += nt(n, r);
			let e = n._debugInfo;
			if (e && Array.isArray(e)) for (let n = e.length - 1; n >= 0; n--) {
				let r = e[n];
				typeof r.name == `string` && (t += tt(r.name, r.env));
			}
			r = n, n = n.return;
		} while (n);
		return t;
	} catch (e) {
		return e instanceof Error ? `\nError generating stack: ${e.message}\n${e.stack}` : ``;
	}
}, it = (e) => {
	let t = Error.prepareStackTrace;
	Error.prepareStackTrace = void 0;
	let n = e;
	if (!n) return ``;
	Error.prepareStackTrace = t, n.startsWith(`Error: react-stack-top-frame
`) && (n = n.slice(29));
	let r = n.indexOf(`
`);
	r !== -1 && (n = n.slice(r + 1));
	let i = Math.max(n.indexOf(`react_stack_bottom_frame`), n.indexOf(`react-stack-bottom-frame`));
	if (i !== -1 && (i = n.lastIndexOf(`
`, i)), i !== -1) n = n.slice(0, i);
	else return ``;
	return n;
}, at = (e) => !!(e.functionName && e.fileName && lt(e.fileName)), ot = (e, t) => e.fileName === t.fileName && e.lineNumber === t.lineNumber && e.columnNumber === t.columnNumber, st = (e) => {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) for (let e of n.stackFrames) {
		if (!at(e)) continue;
		let n = e.functionName, r = t.get(n) ?? [];
		r.some((t) => ot(t, e)) || (r.push(e), t.set(n, r));
	}
	return t;
}, ct = (e, t, n) => {
	if (!e.functionName) return {
		...e,
		isServer: !0
	};
	let r = t.get(e.functionName);
	if (!r || r.length === 0) return {
		...e,
		isServer: !0
	};
	let i = n.get(e.functionName) ?? 0, a = r[i % r.length];
	return n.set(e.functionName, i + 1), {
		...e,
		isServer: !0,
		fileName: a.fileName,
		lineNumber: a.lineNumber,
		columnNumber: a.columnNumber,
		source: e.source?.replace(`(at Server)`, `(${a.fileName}:${a.lineNumber}:${a.columnNumber})`)
	};
}, lt = (e) => ue.some((t) => e.startsWith(t)), ut = (e) => !e.isServer && e.fileName && lt(e.fileName) ? {
	...e,
	isServer: !0
} : e, dt = (e) => {
	let t = [], n = e;
	for (; n;) if (Xe(n)) {
		let e = n;
		if (n = Ze(e), n && E(e)) {
			let { frames: n, isTrusted: r } = S(e._debugStack);
			if (r) for (let e of n) t.push(ut(e));
		}
	} else {
		let e = n;
		if (n = e.owner, n && e.debugStack instanceof Error) for (let n of S(e.debugStack).frames) t.push({
			...n,
			isServer: !0
		});
	}
	return t;
}, ft = (e) => {
	let t = [];
	return wt$1(e, (e) => {
		if (!E(e)) return;
		let n = typeof e.type == `string` ? e.type : Ot$1(e.type) || `<anonymous>`;
		t.push({
			componentName: n,
			stackFrames: b(it(e._debugStack?.stack))
		});
	}, !0), t;
}, pt = async (e, t = !0, n) => {
	let r = ft(e), i = b(rt(e)), a = st(r), o = /* @__PURE__ */ new Map();
	return T(i.map((e) => (e.source?.includes(`(at Server)`) ?? !1) || e.source != null && he.test(e.source) ? ct(e, a, o) : e).filter((e, t, n) => {
		if (t === 0) return !0;
		let r = n[t - 1];
		return e.functionName !== r.functionName;
	}), t, n);
}, mt = (e) => !!e.fileName && !e.isIgnoreListed, ht = async (e, t = !0, n) => {
	let r = dt(e);
	if (r.length > 0) {
		let i = Qe(e) ?? {};
		i.functionName = Ot$1(e.type) ?? i.functionName;
		let a = await T([i, ...r], t, n);
		if (a.some((e, t) => t > 0 && mt(e))) return a;
	}
	return pt(e, t, n);
}, gt = (e) => {
	let t = e._debugSource;
	return t ? typeof t == `object` && !!t && `fileName` in t && typeof t.fileName == `string` && `lineNumber` in t && typeof t.lineNumber == `number` : !1;
}, _t = (e) => e.fileName ? {
	fileName: e.fileName,
	lineNumber: e.lineNumber,
	columnNumber: e.columnNumber,
	functionName: e.functionName
} : null, vt = (e) => {
	if (!E(e)) return null;
	let { frames: t, isTrusted: n } = S(e._debugStack);
	if (!n) return null;
	for (let e of t) if (e.fileName) return e;
	return null;
}, yt = async (e, t = !0, n) => {
	if (gt(e)) return e._debugSource || null;
	let r = vt(e) ?? Qe(e);
	if (r) {
		let [e] = await T([r], t, n), i = _t(e);
		if (i) return i;
	}
	let i = await pt(e, t, n);
	for (let e of i) if (e.fileName) return _t(e);
	return null;
}, bt = (e) => e.split(`/`).filter(Boolean).length, xt = (e) => e.split(`/`).filter(Boolean)[0] ?? null, St = (e) => {
	let t = e.indexOf(`/`, 1);
	if (t === -1 || bt(e.slice(0, t)) !== 1) return e;
	let n = e.slice(t);
	if (!fe.test(n) || bt(n) < 2) return e;
	let r = xt(n);
	return !r || r.startsWith(`@`) || r.length > 4 ? e : n;
}, j$1 = (e) => {
	if (!e || de.some((t) => t === e)) return ``;
	let t = e, n = t.startsWith(`http://`) || t.startsWith(`https://`);
	if (n) try {
		t = new URL(t).pathname;
	} catch {}
	if (n && (t = St(t)), t.startsWith(`about://React/`)) {
		let e = t.slice(14), n = e.indexOf(`/`), r = e.indexOf(`:`);
		t = n !== -1 && (r === -1 || n < r) ? e.slice(n + 1) : e;
	}
	let r = !0;
	for (; r;) {
		r = !1;
		for (let e of le) if (t.startsWith(e)) {
			t = t.slice(e.length), e === `file:///` && (t = `/${t.replace(/^\/+/, ``)}`), r = !0;
			break;
		}
	}
	if (ce.test(t)) {
		let e = t.match(ce);
		e && (t = t.slice(e[0].length));
	}
	if (t.startsWith(`//`)) {
		let e = t.indexOf(`/`, 2);
		t = e === -1 ? `` : t.slice(e);
	}
	let i = t.indexOf(`?`);
	if (i !== -1) {
		let e = t.slice(i);
		me.test(e) && (t = t.slice(0, i));
	}
	return t;
}, Ct = (e) => {
	let t = j$1(e);
	return !(!t || !fe.test(t) || pe.test(t));
}, wt = Symbol.for(`react.context`);
let Tt = [], Et = null;
const Dt = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render."), M$1 = () => {
	let e = Et;
	return e !== null && (Et = e.next), e;
}, N$1 = (e) => e._currentValue, P$1 = (e, t, n, r = null) => {
	Tt.push({
		displayName: r,
		primitive: e,
		stackError: Error(),
		value: t,
		dispatcherHookName: n
	});
}, Ot = (e) => {
	if (typeof e == `object` && e) {
		let t = e;
		if (typeof t.then == `function`) {
			let e = t;
			switch (e.status) {
				case `fulfilled`: return P$1(`Promise`, e.value, `Use`), e.value;
				case `rejected`: throw e.reason;
			}
			throw P$1(`Unresolved`, e, `Use`), Dt;
		}
		if (t.$$typeof === wt && `_currentValue` in t) {
			let e = t, n = N$1(e);
			return P$1(`Context (use)`, n, `Use`, e.displayName || `Context`), n;
		}
	}
	throw Error(`An unsupported type was passed to use(): ` + String(e));
}, kt = (e) => {
	let t = N$1(e);
	return P$1(`Context`, t, `Context`, e.displayName || null), t;
}, At = (e) => {
	let t = M$1(), n = t === null ? typeof e == `function` ? e() : e : t.memoizedState;
	return P$1(`State`, n, `State`), [n, () => {}];
}, jt = (e, t, n) => {
	let r = M$1(), i = r === null ? n === void 0 ? t : n(t) : r.memoizedState;
	return P$1(`Reducer`, i, `Reducer`), [i, () => {}];
}, Mt = (e) => {
	let t = M$1(), n = t === null ? { current: e } : t.memoizedState;
	return P$1(`Ref`, n.current, `Ref`), n;
}, Nt = () => {
	let e = M$1();
	return P$1(`CacheRefresh`, e === null ? () => {} : e.memoizedState, `CacheRefresh`), () => {};
}, Pt = (e) => {
	M$1(), P$1(`LayoutEffect`, e, `LayoutEffect`);
}, Ft = (e) => {
	M$1(), P$1(`InsertionEffect`, e, `InsertionEffect`);
}, It = (e) => {
	M$1(), P$1(`Effect`, e, `Effect`);
}, Lt = (e) => {
	M$1();
	let t;
	typeof e == `object` && e && `current` in e && (t = e.current), P$1(`ImperativeHandle`, t, `ImperativeHandle`);
}, Rt = (e, t) => {
	P$1(`DebugValue`, typeof t == `function` ? t(e) : e, `DebugValue`);
}, zt = (e) => {
	let t = M$1();
	return P$1(`Callback`, t === null ? e : t.memoizedState[0], `Callback`), e;
}, Bt = (e) => {
	let t = M$1(), n = t === null ? e() : t.memoizedState[0];
	return P$1(`Memo`, n, `Memo`), n;
}, Vt = (e, t) => {
	let n = M$1();
	M$1();
	let r = n === null ? t() : n.memoizedState;
	return P$1(`SyncExternalStore`, r, `SyncExternalStore`), r;
}, Ht = () => {
	let e = M$1();
	M$1();
	let t = e === null ? !1 : e.memoizedState;
	return P$1(`Transition`, t, `Transition`), [t, () => {}];
}, Ut = (e) => {
	let t = M$1(), n = t === null ? e : t.memoizedState;
	return P$1(`DeferredValue`, n, `DeferredValue`), n;
}, Wt = () => {
	let e = M$1(), t = e === null ? `` : e.memoizedState;
	return P$1(`Id`, t, `Id`), t;
}, Gt = (e) => [], Kt = (e) => {
	let t = M$1(), n = t === null ? e : t.memoizedState;
	return P$1(`Optimistic`, n, `Optimistic`), [n, () => {}];
}, qt = (e, t) => {
	let n, r = null;
	if (e !== null) {
		let t = e.memoizedState;
		if (typeof t == `object` && t && `then` in t && typeof t.then == `function`) {
			let e = t;
			switch (e.status) {
				case `fulfilled`:
					n = e.value;
					break;
				case `rejected`:
					r = e.reason;
					break;
				default: r = Dt, n = e;
			}
		} else n = t;
	} else n = t;
	return {
		value: n,
		error: r
	};
}, Jt = (e) => (t, n) => {
	let r = M$1();
	M$1(), M$1();
	let i = Error(), { value: a, error: o } = qt(r, n);
	if (Tt.push({
		displayName: null,
		primitive: e,
		stackError: i,
		value: a,
		dispatcherHookName: e
	}), o !== null) throw o;
	return [
		a,
		() => {},
		!1
	];
}, Yt = Jt(`ActionState`), Xt = {
	readContext: N$1,
	use: Ot,
	useCallback: zt,
	useContext: kt,
	useEffect: It,
	useImperativeHandle: Lt,
	useLayoutEffect: Pt,
	useInsertionEffect: Ft,
	useMemo: Bt,
	useReducer: jt,
	useRef: Mt,
	useState: At,
	useDebugValue: Rt,
	useDeferredValue: Ut,
	useTransition: Ht,
	useSyncExternalStore: Vt,
	useId: Wt,
	useHostTransitionStatus: () => {
		let e = N$1({ _currentValue: null });
		return P$1(`HostTransitionStatus`, e, `HostTransitionStatus`), e;
	},
	useFormState: Jt(`FormState`),
	useActionState: Yt,
	useOptimistic: Kt,
	useMemoCache: Gt,
	useCacheRefresh: Nt,
	useEffectEvent: (e) => (M$1(), P$1(`EffectEvent`, e, `EffectEvent`), e)
};
typeof Proxy > `u` || new Proxy(Xt, { get(e, t) {
	if (Object.prototype.hasOwnProperty.call(e, t)) return e[t];
	let n = Error(`Missing method in Dispatcher: ` + t);
	throw n.name = `ReactDebugToolsUnsupportedHookError`, n;
} });
const Zt = (e) => e === void 0 || !Number.isFinite(e) ? 3 : Math.max(0, Math.floor(e)), Qt = /^(?:\.\/)?\/?\([a-z][a-z0-9-]*\)\//, F$1 = (e) => {
	let t = j$1(e);
	return t = t.replace(Qt, ``), t.startsWith(`./`) && (t = t.slice(2)), t;
}, I$1 = (e) => {
	try {
		return decodeURIComponent(e);
	} catch {
		return e;
	}
}, $t = /(?:^|[/\\])node_modules[/\\]/, en = /[/\\]\.vite[/\\]deps[^/\\]*[/\\]/, tn = /\.[mc]?[jt]sx?$/i, nn = /^chunk-[A-Za-z0-9_-]+$/, rn = /[/\\]/, an = /^(.+?)@v?\d/, L$1 = (e) => e.split(rn).filter(Boolean), on = (e) => {
	let [t, n] = L$1(e);
	return !t || t.startsWith(`.`) ? null : t.startsWith(`@`) ? n ? `${t}/${n}` : null : t;
}, sn = (e) => {
	let t = L$1(e)[0];
	if (!t) return null;
	let n = t.replace(tn, ``);
	if (nn.test(n)) return null;
	if (!n.startsWith(`@`)) return n;
	let r = n.indexOf(`_`);
	return r === -1 ? null : `${n.slice(0, r)}/${n.slice(r + 1)}`;
}, cn = (e, t, n) => {
	let r = e.split(t);
	return r.length > 1 ? n(r[r.length - 1]) : null;
}, ln = (e) => e?.match(an)?.[1] ?? null, un = (e) => {
	let t;
	try {
		t = new URL(e);
	} catch {
		return null;
	}
	if (!t.hostname) return null;
	let n = L$1(t.pathname).map(I$1);
	for (let [e, t] of n.entries()) {
		if (t.startsWith(`@`)) {
			let r = ln(n[e + 1]);
			if (r) return `${t}/${r}`;
			continue;
		}
		let r = ln(t);
		if (r) return r;
	}
	return null;
}, dn = (e) => cn(e, en, sn) ?? cn(e, $t, on), fn = (e) => {
	if (!e) return null;
	let t = j$1(e);
	return t && (dn(I$1(t)) || un(e)) || null;
}, pn = /^@[A-Za-z0-9][A-Za-z0-9._-]*$/, mn = /^[A-Za-z0-9][A-Za-z0-9._-]*$/, hn = /* @__PURE__ */ new Set([
	`app`,
	`web`,
	`website`,
	`frontend`,
	`client`,
	`src`
]), gn = /* @__PURE__ */ new Set([
	`app`,
	`src`,
	`components`,
	`pages`,
	`features`,
	`modules`,
	`hooks`,
	`lib`,
	`utils`,
	`ui`,
	`shared`,
	`common`,
	`core`,
	`styles`,
	`assets`
]), _n = (e) => {
	let t = e;
	for (; t.startsWith(`../`) || t.startsWith(`./`);) t = t.slice(t.startsWith(`../`) ? 3 : 2);
	return t;
}, vn = (e) => {
	let t = _n(I$1(j$1(e)));
	if (t.startsWith(`/`)) return null;
	let [n, r, ...i] = L$1(t);
	return !n || !r || i.length === 0 || !pn.test(n) || gn.has(n.slice(1)) || !mn.test(r) || tn.test(r) || hn.has(r) ? null : `${n}/${r}`;
}, yn = (e) => e ? fn(e) ?? vn(e) : null, R$1 = (e) => {
	if (!e) return {
		origin: `unknown`,
		packageName: null
	};
	let t = yn(e);
	return t ? {
		origin: `package`,
		packageName: t
	} : Ct(e) ? {
		origin: `app`,
		packageName: null
	} : {
		origin: `unknown`,
		packageName: null
	};
}, bn = /* @__PURE__ */ new Set([
	`role`,
	`name`,
	`aria-label`,
	`rel`,
	`href`
]), z$1 = (e) => {
	if (!/^[a-z-]{3,}$/i.test(e)) return !1;
	let t = e.split(/-|[A-Z]/);
	for (let e of t) if (e.length <= 2 || /[^aeiou]{4,}/i.test(e)) return !1;
	return !0;
}, xn = (e, t) => {
	let n = bn.has(e) || e.startsWith(`data-`) && z$1(e), r = z$1(t) && t.length < 100 || t.startsWith(`#`) && z$1(t.slice(1));
	return n && r;
}, Sn = (e) => {
	let t = e[0].name;
	for (let n = 1; n < e.length; n++) t = `${e[n].name} > ${t}`;
	return t;
}, Cn = (e) => {
	let t = 0;
	for (let n of e) t += n.penalty;
	return t;
}, wn = (e, t) => Cn(e) - Cn(t), Tn = (e, t) => {
	let n = e.parentNode;
	if (!n) return;
	let r = n.firstChild;
	if (!r) return;
	let i = 0;
	for (; r && (Ye$1(r) && (t === void 0 || r.tagName.toLowerCase() === t) && i++, r !== e);) r = r.nextSibling;
	return i;
}, En = (e, t) => e === `html` ? `html` : `${e}:nth-child(${t})`, Dn = (e, t) => e === `html` ? `html` : `${e}:nth-of-type(${t})`, On = (e, t) => {
	let n = [], r = e.getAttribute(`id`), i = e.tagName.toLowerCase();
	r && z$1(r) && n.push({
		name: `#${CSS.escape(r)}`,
		penalty: 0
	});
	for (let t of e.classList) z$1(t) && n.push({
		name: `.${CSS.escape(t)}`,
		penalty: 1
	});
	for (let r of e.attributes) t(r.name, r.value) && n.push({
		name: `[${CSS.escape(r.name)}="${CSS.escape(r.value)}"]`,
		penalty: 2
	});
	n.push({
		name: i,
		penalty: 5
	});
	let a = Tn(e, i);
	a !== void 0 && n.push({
		name: Dn(i, a),
		penalty: 10
	});
	let o = Tn(e);
	return o !== void 0 && n.push({
		name: En(i, o),
		penalty: 50
	}), n;
}, B$1 = (e, t = p, n = []) => {
	if (t <= 0) return [];
	if (e.length === 0) return [n];
	let r = [];
	for (let i of e[0]) {
		let a = t - r.length;
		if (a <= 0) break;
		r.push(...B$1(e.slice(1), a, [...n, i]));
	}
	return r;
}, kn = (e, t) => {
	let n = t.getRootNode();
	return on$1(n) ? n : Cn$1(e) ? e : e.ownerDocument;
}, V$1 = (e, t) => t.querySelectorAll(Sn(e)).length === 1, An = (e, t) => {
	let n = e, r = [];
	for (; n && n !== t;) {
		let e = n.tagName.toLowerCase(), t = Tn(n, e);
		if (t === void 0) return;
		r.push({
			name: Dn(e, t),
			penalty: 10
		}), n = n.parentElement;
	}
	return V$1(r, t) ? r : void 0;
}, jn = (e, t, n, i) => {
	if (e.nodeType !== Node.ELEMENT_NODE) throw new mn$1();
	if (e.tagName.toLowerCase() === `html`) return `html`;
	let o = kn(t, e), s = Date.now(), l = [], u = e, d = 0, f;
	for (; u && u !== o && !f;) if (l.push(On(u, i)), u = u.parentElement, d++, d >= 3) {
		let t = B$1(l);
		t.sort(wn);
		for (let r of t) {
			if (Date.now() - s > n) {
				let t = An(e, o);
				if (!t) throw new hn$1(n);
				return Sn(t);
			}
			if (V$1(r, o)) {
				f = r;
				break;
			}
		}
	}
	if (!f && d < 3) {
		let e = B$1(l);
		e.sort(wn);
		for (let t of e) {
			if (Date.now() - s > n) break;
			if (V$1(t, o)) {
				f = t;
				break;
			}
		}
	}
	if (!f) throw new gn$1();
	return Sn(f);
}, Mn = (e) => e.ownerDocument.body ?? e.ownerDocument.documentElement, Nn = /* @__PURE__ */ new Set([
	`data-testid`,
	`data-test-id`,
	`data-test`,
	`data-cy`,
	`data-qa`,
	`aria-label`,
	`href`,
	`src`,
	`role`,
	`name`,
	`title`,
	`alt`
]), Pn = (e) => e.length > 0 && e.length <= 120, H$1 = (e, t) => {
	try {
		let n = e.getRootNode(), r = (on$1(n) ? n : e.ownerDocument).querySelectorAll(t);
		return r.length === 1 && r[0] === e;
	} catch {
		return !1;
	}
}, Fn = (e) => {
	let t = e.getAttribute(`id`);
	if (t) {
		let n = `#${CSS.escape(t)}`;
		if (H$1(e, n)) return n;
	}
	for (let t of Nn) {
		let n = e.getAttribute(t);
		if (!n || !Pn(n)) continue;
		let r = `[${t}=${JSON.stringify(n)}]`;
		if (H$1(e, r)) return r;
		let i = `${e.tagName.toLowerCase()}${r}`;
		if (H$1(e, i)) return i;
	}
	return null;
}, In = (e) => {
	let t = [], n = e.getRootNode(), r = on$1(n) ? n : Mn(e), i = e;
	for (; i;) {
		let e = i.getAttribute(`id`);
		if (e) {
			t.unshift(`#${CSS.escape(e)}`);
			break;
		}
		let n = i.parentNode;
		if (!n) {
			t.unshift(i.tagName.toLowerCase());
			break;
		}
		let a = Array.from(n.children).indexOf(i) + 1;
		if (t.unshift(`${i.tagName.toLowerCase()}:nth-child(${a})`), n === r) {
			Ye$1(r) && t.unshift(r.tagName.toLowerCase());
			break;
		}
		i = Ye$1(n) ? n : null;
	}
	return t.join(` > `);
}, Ln = (e) => {
	let t = Fn(e);
	if (t) return t;
	try {
		let t = jn(e, Mn(e), 200, (e, t) => xn(e, t) || Nn.has(e) && Pn(t));
		if (t) return t;
	} catch {}
	return In(e);
}, U$1 = (t) => {
	let n = w$1(t);
	if (n) return n.getSelector();
	let r = Ln(t), i = t.getRootNode();
	if (on$1(i)) return `${U$1(i.host)} >>> ${r}`;
	let a = $e$1(t.ownerDocument.defaultView);
	return a ? `${U$1(a)} >>iframe>> ${r}` : r;
}, Rn = [
	`[id]`,
	`[data-testid]`,
	`[data-test-id]`,
	`[data-test]`,
	`[data-cy]`,
	`[data-qa]`,
	`[aria-label]`,
	`a[href]`,
	`button`,
	`input`,
	`select`,
	`textarea`,
	`[role="button"]`,
	`[role="link"]`,
	`[role="checkbox"]`,
	`[role="radio"]`,
	`[role="switch"]`,
	`[role="tab"]`,
	`[role="menuitem"]`,
	`[role="option"]`,
	`[role="textbox"]`,
	`[role="combobox"]`,
	`[role="slider"]`,
	`[role="spinbutton"]`
].join(`,`), zn = (e) => {
	let { body: t, documentElement: n } = e.ownerDocument;
	if (e === t || e === n) return !0;
	if (!t) return !1;
	let r = t.getElementsByTagName(`*`).length;
	return r === 0 ? !1 : e.getElementsByTagName(`*`).length / r >= ee;
}, Bn = (e) => {
	let t = e.closest(Rn);
	return !t || zn(t) ? e : t;
}, Vn = [
	/\/assets\/[^/?#]+-[a-z0-9_-]{6,}\.(?:c|m)?js(?:[?#]|$)/,
	/\/_next\/static\/.*\.(?:c|m)?js(?:[?#]|$)/,
	/\/static\/chunks\/.*\.(?:c|m)?js(?:[?#]|$)/
], Hn = (e) => {
	if (!e) return !1;
	let t = `/${F$1(e)}`.toLowerCase();
	return Vn.some((e) => e.test(t));
}, Un = (e) => {
	if (!e) return !1;
	let t = `/${F$1(e)}/`.toLowerCase();
	return u.some((e) => t.includes(e));
};
let W$1;
const G$1 = (e) => (e && (W$1 = void 0), W$1 ??= typeof document < `u` && !!(document.getElementById(`__NEXT_DATA__`) || document.querySelector(`nextjs-portal`)), W$1), Wn = (e) => e.map((e) => `\n  in ${e}`).join(``);
let K$1;
const Gn = () => {
	if (K$1 !== void 0) return K$1;
	let e = document.querySelector(`script[src*="/_next/"]`)?.src, t = e ? new URL(e).pathname : ``, n = t.indexOf(`/_next/`);
	return K$1 = n > 0 ? t.slice(0, n) : ``, K$1;
}, Kn = [`about://React/`, `rsc://React/`], qn = (e) => Kn.some((t) => e.startsWith(t)), Jn = (e) => {
	for (let t of Kn) {
		if (!e.startsWith(t)) continue;
		let n = e.indexOf(`/`, t.length);
		if (n === -1) continue;
		let r = n + 1, i = e.lastIndexOf(`?`);
		return I$1(i > r ? e.slice(r, i) : e.slice(r));
	}
	return e;
}, Yn = (e) => {
	if (typeof e != `object` || !e || !(`status` in e) || e.status !== `fulfilled` || !(`value` in e) || typeof e.value != `object` || e.value === null || !(`originalStackFrame` in e.value)) return null;
	let t = e.value.originalStackFrame;
	return typeof t != `object` || !t || !(`file` in t) || typeof t.file != `string` || !t.file || `ignored` in t && t.ignored ? null : {
		file: t.file,
		line1: `line1` in t && typeof t.line1 == `number` ? t.line1 : null,
		column1: `column1` in t && typeof t.column1 == `number` ? t.column1 : null
	};
}, Xn = async (e, t) => {
	let n = [], r = [];
	for (let t = 0; t < e.length; t++) {
		let i = e[t];
		!i.isServer || !i.fileName || (n.push(t), r.push({
			file: Jn(i.fileName),
			methodName: i.functionName ?? `<unknown>`,
			line1: i.lineNumber ?? null,
			column1: i.columnNumber ?? null,
			arguments: []
		}));
	}
	if (r.length === 0) return e;
	let i = new AbortController(), a = setTimeout(() => i.abort(), d), o = () => i.abort();
	t?.aborted && i.abort(), t?.addEventListener(`abort`, o);
	try {
		let t = await fetch(`${Gn()}/__nextjs_original-stack-frames`, {
			method: `POST`,
			headers: { "Content-Type": `application/json` },
			body: JSON.stringify({
				frames: r,
				isServer: !0,
				isEdgeServer: !1,
				isAppDirectory: !0
			}),
			priority: `high`,
			signal: i.signal
		});
		if (!t.ok) return e;
		let a = await t.json();
		if (!Array.isArray(a)) return e;
		let o = [...e];
		for (let t = 0; t < n.length; t++) {
			let r = Yn(a[t]);
			if (!r) continue;
			let i = n[t];
			o[i] = {
				...e[i],
				fileName: r.file,
				lineNumber: r.line1 ?? void 0,
				columnNumber: r.column1 ?? void 0,
				isSymbolicated: !0
			};
		}
		return o;
	} catch {
		return e;
	} finally {
		clearTimeout(a), t?.removeEventListener(`abort`, o);
	}
}, Zn = (e) => {
	let t = /* @__PURE__ */ new Map();
	return wt$1(e, (e) => {
		if (!E(e)) return !1;
		let n = it(e._debugStack.stack);
		if (!n) return !1;
		for (let e of b(n)) !e.functionName || !e.fileName || qn(e.fileName) && (t.has(e.functionName) || t.set(e.functionName, {
			...e,
			isServer: !0
		}));
		return !1;
	}, !0), t;
}, Qn = (e, t) => {
	if (!t.some((e) => e.isServer && !e.fileName && e.functionName)) return t;
	let n = Zn(e);
	return n.size === 0 ? t : t.map((e) => {
		if (!e.isServer || e.fileName || !e.functionName) return e;
		let t = n.get(e.functionName);
		return t ? {
			...e,
			fileName: t.fileName,
			lineNumber: t.lineNumber,
			columnNumber: t.columnNumber
		} : e;
	});
};
let q = 0;
const $n = [], er = () => q < 3 ? (q += 1, Promise.resolve()) : new Promise((e) => {
	$n.push(e);
}), tr = () => {
	let e = $n.shift();
	if (e) {
		e();
		return;
	}
	--q;
}, nr = async (e, t, n = f) => {
	await er();
	let r = new AbortController(), i, a = new Promise((e) => {
		i = setTimeout(() => {
			r.abort(), e(t);
		}, n);
	});
	try {
		let t = e(r.signal);
		return t.catch(() => {}), await Promise.race([t, a]);
	} finally {
		clearTimeout(i), tr();
	}
}, J = (e, t) => e.length > t ? `${e.slice(0, t)}...` : e, rr = (e) => e.startsWith(`data-react-grab-`), ir = (e) => e.replace(/\s+/g, ` `).trim(), ar = (e) => {
	let t = [];
	for (let n of e.childNodes) {
		if (n.nodeType !== Node.TEXT_NODE) continue;
		let e = ir(n.textContent ?? ``);
		e && t.push(e);
	}
	return t.join(` `);
}, or = (e) => e.getAttribute(`aria-hidden`) === `true` || e.hasAttribute(`hidden`) ? !0 : he$1.has(e.tagName.toLowerCase()), sr = (e, t, n) => {
	if (e.nodeType === Node.TEXT_NODE) {
		let r = ir(e.textContent ?? ``);
		return r ? (t.push(r), n - r.length) : n;
	}
	if (!Ye$1(e) || or(e)) return n;
	for (let r of e.childNodes) if (n = sr(r, t, n), n <= 0) break;
	return n;
}, cr = (e, t) => {
	if (or(e)) return ``;
	let n = ar(e);
	if (!me$1.has(t) || n && e.children.length === 0) return n;
	let r = [];
	return sr(e, r, 100), r.join(` `);
}, lr = (e) => J(e, 15), dr = (e) => e === `class` || e === `className` || e === `style`, fr = (e) => {
	let t = [], n = [], r = ``;
	for (let { name: i, value: a } of e.attributes) if (!rr(i)) {
		if (dr(i)) {
			i !== `style` && a && (r = ` class="${lr(a)}"`);
			continue;
		}
		pe$1.has(i) ? t.push(a ? ` ${i}="${a}"` : ` ${i}`) : a && n.push(` ${i}="${lr(a)}"`);
	}
	return t.join(``) + n.join(``) + r;
}, pr = (e) => e.length === 0 ? `` : e.length <= 2 ? e.map((e) => `<${vn$1(e)} ...>`).join(`
  `) : `(${e.length} elements)`, hr = (t) => {
	let r = w$1(t);
	if (r) return r.getPreview();
	let i = vn$1(t), a = fr(t), o = cr(t, i), s = [], c = [], l = !1;
	for (let e of t.childNodes) e.nodeType !== Node.COMMENT_NODE && (e.nodeType === Node.TEXT_NODE ? e.textContent && e.textContent.trim().length > 0 && (l = !0) : Ye$1(e) && (l ? c.push(e) : s.push(e)));
	let u = o.length > 0 && me$1.has(i), d = ``, f = pr(s);
	f && !u && (d += `\n  ${f}`), o && (d += `\n  ${J(o, 100)}`);
	let p = pr(c);
	return p && !u && (d += `\n  ${p}`), d.length > 0 ? `<${i}${a}>${d}\n</${i}>` : `<${i}${a} />`;
}, gr = /* @__PURE__ */ new Set([
	`_`,
	`$`,
	`motion.`,
	`styled.`,
	`chakra.`,
	`ark.`,
	`Primitive.`,
	`Slot.`
]), _r = new Set(`AppRouter.AppRouterAnnouncer.AppDevOverlay.AppDevOverlayErrorBoundary.ClientPageRoot.ClientSegmentRoot.DevRootHTTPAccessFallbackBoundary.ErrorBoundary.ErrorBoundaryHandler.GracefulDegradeBoundary.HTTPAccessErrorFallback.HTTPAccessFallbackBoundary.HTTPAccessFallbackErrorBoundary.HandleRedirect.Head.HistoryUpdater.HotReload.InnerLayoutRouter.InnerScrollAndFocusHandler.InnerScrollAndFocusHandlerOld.InnerScrollAndMaybeFocusHandler.InnerScrollHandlerNew.LoadableComponent.LoadingBoundary.LoadingBoundaryProvider.NotAllowedRootHTTPFallbackError.OfflineProvider.OuterLayoutRouter.RedirectBoundary.RedirectErrorBoundary.RenderFromTemplateContext.RenderValidationBoundaryAtThisLevel.ReplaySsrOnlyErrors.RootErrorBoundary.RootLevelDevOverlayElement.Router.ScrollAndFocusHandler.ScrollAndMaybeFocusHandler.SegmentBoundaryTrigger.SegmentBoundaryTriggerNode.SegmentStateProvider.SegmentTrieNode.SegmentViewNode.SegmentViewStateNode.ServerRoot.body.html`.split(`.`)), vr = /* @__PURE__ */ new Set([
	`<anonymous>`,
	`<unknown>`,
	`Anonymous`,
	`Unknown`
]), yr = /* @__PURE__ */ new Set([
	`Suspense`,
	`Fragment`,
	`StrictMode`,
	`Profiler`,
	`SuspenseList`
]), br = /* @__PURE__ */ new Set([
	`MotionDOMComponent`,
	`Slot`,
	`SlotClone`
]), xr = [
	`.Consumer`,
	`.Context`,
	`.Provider`,
	`.Slot`,
	`.SlotClone`,
	`.Slottable`,
	`ProviderProvider`
], Sr = (e) => {
	if (vr.has(e) || _r.has(e) || yr.has(e) || br.has(e)) return !0;
	for (let t of xr) if (e.endsWith(t)) return !0;
	for (let t of gr) if (e.startsWith(t)) return !0;
	return !1;
}, Cr = (e) => !(!e || Sr(e)), wr = (e) => !(e.length <= 1 || Sr(e) || e[0] !== e[0].toUpperCase()), Y = (e) => e && wr(e) ? e : null, X = (e) => !Un(e) && !Hn(e), Z = (e) => {
	if (!kt$1()) return e;
	let t = e;
	for (; t?.ownerDocument === e.ownerDocument;) {
		if ($t$1(t)) return t;
		if (t.parentElement) {
			t = t.parentElement;
			continue;
		}
		let e = t.getRootNode();
		t = on$1(e) ? e.host : null;
	}
	return e;
}, Tr = (e) => {
	let t = e.return?.child ?? null;
	for (; t;) {
		if (t !== e && t.key !== null) return !0;
		t = t.sibling;
	}
	return !1;
}, Er = (e) => {
	let t = e, n = 0;
	for (; t;) {
		if (t.key !== null && Tr(t)) return String(t.key);
		if (yt$1(t) && (n += 1, n === 2)) break;
		t = t.return;
	}
	return null;
}, Dr = (e) => kt$1() ? Er($t$1(Z(e))) : null, Q = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), kr = (e) => (t) => fetch(t, {
	signal: e,
	priority: `high`
}), Ar = (e) => nr(async (t) => {
	try {
		let n = $t$1(e);
		if (!n) return null;
		let r = await ht(n, !0, kr(t));
		return G$1() ? await Xn(Qn(n, r), t) : r;
	} catch {
		return null;
	}
}, null), $ = (e) => {
	if (!kt$1()) return Promise.resolve([]);
	let t = Z(e), n = Q.get(t);
	if (n) return n;
	let r = Ar(t).then((e) => (e === null && Q.delete(t), e));
	return Q.set(t, r), r;
}, Mr = (e) => e.find((e) => !!Y(e.functionName)) ?? e[0] ?? null, Nr = (e) => !e || !yt$1(e) ? null : Y(Ot$1(e.type)), Pr = (e) => nr(async (t) => {
	let n = $t$1(Z(e));
	if (!n) return null;
	try {
		let e = await yt(n, !0, kr(t));
		return e?.fileName ? {
			filePath: F$1(e.fileName),
			lineNumber: e.lineNumber ?? null,
			columnNumber: e.columnNumber ?? null,
			componentName: Y(e.functionName) ?? Nr(n._debugOwner),
			origin: R$1(e.fileName).origin
		} : null;
	} catch {
		return null;
	}
}, null), Fr = (e) => {
	let t = Z(e), n = Or.get(t);
	if (n) return n;
	let r = Pr(t).then((e) => (e || Or.delete(t), e));
	return Or.set(t, r), r;
}, Ir = (e, t) => {
	let n = (e, t) => {
		let n = Mr(e);
		return n?.fileName ? {
			filePath: F$1(n.fileName),
			lineNumber: n.lineNumber ?? null,
			columnNumber: n.columnNumber ?? null,
			componentName: Y(n.functionName),
			origin: t
		} : null;
	}, r = t.filter((e) => R$1(e.fileName).origin === `app`), i = r.filter((e) => X(e.fileName));
	return e?.origin === `app` && X(e.filePath) ? e : n(i, `app`) || (e?.origin === `app` && !Hn(e.filePath) ? e : n(r, `app`) || (e?.origin === `app` || e?.origin === `package` ? e : n(t.filter((e) => R$1(e.fileName).origin === `package`), `package`)));
}, Lr = async (e) => {
	let t = await Fr(e);
	return t?.origin === `app` && X(t.filePath) ? t : Ir(t, await $(e) ?? []);
}, Rr = (e) => zr(Z(e), 1)[0] ?? null, zr = (e, t, n = () => !0) => {
	if (!kt$1()) return [];
	let r = $t$1(e);
	if (!r) return [];
	let i = [];
	return wt$1(r, (e) => {
		if (i.length >= t) return !0;
		if (yt$1(e)) {
			let t = Ot$1(e.type);
			t && Cr(t) && n(t) && i.push(t);
		}
		return !1;
	}, !0), i;
}, Br = [
	`/src/app/`,
	`/src/pages/`,
	`/app/`,
	`/pages/`
], Vr = (e, t) => {
	let n = F$1(e);
	if (!t || !n.startsWith(`/`)) return n;
	for (let e of Br) {
		let t = n.indexOf(e);
		if (t !== -1) return `/./${n.slice(t + 1)}`;
	}
	return n;
}, Hr = (e, t) => {
	let n = Vr(e.filePath, t), r = t && e.lineNumber ? `${n}:${e.lineNumber}${e.columnNumber ? `:${e.columnNumber}` : ``}` : n;
	return e.componentName ? `\n  in ${e.componentName} (at ${r})` : `\n  in ${r}`;
}, Ur = {
	isAppSource: !1,
	consumesBudget: !1
}, Wr = (e, t, n, r) => {
	let i = t.packageName, a = t.origin === `app` ? e.fileName : null;
	if (e.isServer && !a && (n || !e.functionName)) {
		let e = i ? `${i} at Server` : `at Server`;
		return {
			text: `\n  in ${n ?? `<anonymous>`} (${e})`,
			...Ur
		};
	}
	return !a && n ? {
		text: i ? `\n  in ${n} (${i})` : `\n  in ${n}`,
		...Ur
	} : i ? {
		text: `\n  in ${i}`,
		...Ur
	} : a ? {
		text: Hr({
			componentName: n,
			filePath: a,
			lineNumber: e.lineNumber ?? null,
			columnNumber: e.columnNumber ?? null
		}, r),
		isAppSource: !0,
		consumesBudget: X(a)
	} : null;
}, Gr = (e, t = {}, n = null) => {
	let r = Zt(t.maxLines), i = Math.max(r, 20), a = G$1(), o = [], s = /* @__PURE__ */ new Set(), c = null, l = !1, u = !1, d = !1, f = 0, p = (e) => {
		e && s.add(e);
	};
	if (n) {
		let e = n.origin === `app` && X(n.filePath);
		u = e, e && (f += 1), p(n.componentName), o.push(Hr(n, a));
	}
	for (let t of e) {
		if (f >= r || o.length >= i) break;
		let e = R$1(t.fileName), s = Y(t.functionName), m = e.packageName ? `${e.packageName}:${s ?? ``}:${t.isServer ? `server` : `client`}` : null;
		if (m && m === c) continue;
		if (!l && s && s === n?.componentName) {
			l = !0;
			continue;
		}
		let h = Wr(t, e, s, a);
		h !== null && h.text !== o[o.length - 1] && (h.isAppSource && h.consumesBudget && (u = !0), h.consumesBudget && (f += 1, d = !0), p(s), o.push(h.text), c = m);
	}
	return {
		text: o.join(``),
		shouldAppendSelectorHint: !u,
		hasBudgetedStackFrame: d,
		renderedComponentNames: s
	};
}, Kr = (e, t) => {
	let n = Ir(e, t);
	return n?.origin === `app` ? n : null;
}, qr = (e, t, n) => {
	let r = zr(Z(e), n, (e) => wr(e) && !t.renderedComponentNames.has(e));
	return r.length === 0 ? t : {
		...t,
		text: `${t.text}${Wn(r)}`
	};
}, Jr = async (e, t = {}) => {
	let n = await Fr(e), r = await $(e) ?? [], i = Kr(n, r), a = Zt(t.maxLines), o = Gr(r, t, i);
	if (o.text) return o.hasBudgetedStackFrame ? o : qr(e, o, a);
	let s = zr(Z(e), a);
	return {
		text: Wn(s),
		shouldAppendSelectorHint: !0,
		hasBudgetedStackFrame: !1,
		renderedComponentNames: new Set(s)
	};
}, Yr = async (e, t = {}) => (await Jr(e, t)).text, Xr = (e, t) => {
	let n = Dr(e), r = n === null ? `` : `\n  key: "${n}"`, i = t.shouldAppendSelectorHint ? `\n  selector: ${U$1(Bn(e))}` : ``;
	return `${t.text}${r}${i}`;
}, Qr = async (e, t = {}) => {
	let n = Z(e);
	return `${hr(n)}${Xr(n, await Jr(n, t))}`;
};
//#endregion
//#region ../../node_modules/.pnpm/react-grab@0.1.50_react@19.2.6/node_modules/react-grab/dist/primitives.js
/**
* @license MIT
*
* Copyright (c) 2025 Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
const O = new Map([
	`top`,
	`right`,
	`bottom`,
	`left`
].flatMap((e) => [[`border-${e}-style`, e], [`border-${e}-color`, e]]));
let k = null;
const A = /* @__PURE__ */ new Map(), j = () => k || (k = document.createElement(`iframe`), k.style.cssText = `position:fixed;left:-9999px;width:0;height:0;border:none;visibility:hidden;`, document.body.appendChild(k), k), M = (e) => {
	let t = A.get(e);
	if (t) return t;
	let n = j(), r = n.contentDocument, i = r.createElement(e);
	r.body.appendChild(i);
	let a = n.contentWindow.getComputedStyle(i), o = /* @__PURE__ */ new Map();
	for (let e of Je$1) {
		let t = a.getPropertyValue(e);
		t && o.set(e, t);
	}
	return i.remove(), A.set(e, o), o;
}, N = (e, t) => {
	let n = O.get(e);
	if (!n) return !1;
	let r = t.getPropertyValue(`border-${n}-width`);
	return r === `0px` || r === `0`;
}, P = (t) => {
	if (w$1(t)?.supportsDomEditing === !1) return ``;
	let n = M(t.tagName.toLowerCase()), r = getComputedStyle(t), i = [];
	for (let e of Je$1) {
		let t = r.getPropertyValue(e);
		t && t !== n.get(e) && (N(e, r) || i.push(`${e}: ${t};`));
	}
	let a = t.getAttribute(`class`)?.trim(), o = i.join(`
`);
	return a ? o ? `className: ${a}\n\n${o}` : `className: ${a}` : o;
}, V = (e) => U$1(Bn(e)), H = async (e) => {
	let [t, n, r] = await Promise.all([
		Qr(e),
		Lr(e),
		$(e).then((e) => e ?? [])
	]), i = await Yr(e), a = hr(e), o = Rr(e), c = $t$1(e), l = V(e), u = P(e);
	return {
		element: e,
		snippet: t,
		htmlPreview: a,
		stackString: i,
		stack: r,
		componentName: o,
		filePath: n?.filePath ?? null,
		lineNumber: n?.lineNumber ?? null,
		columnNumber: n?.columnNumber ?? null,
		fiber: c,
		selector: l,
		styles: u
	};
};
//#endregion
//#region src/preview/AnnotationKeyboard.ts
function resolveAnnotationSubmission(event) {
	if (event.key !== "Enter" || event.shiftKey || event.isComposing) return null;
	return event.metaKey || event.ctrlKey ? "send" : "attach";
}
//#endregion
//#region src/preview/AnnotationStyles.generated.ts
const previewAnnotationStyles = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties;\n:root, :host {\n  --spacing: 0.25rem;\n  --text-xs: 0.75rem;\n  --text-xs--line-height: calc(1 / 0.75);\n  --text-sm: 0.875rem;\n  --text-sm--line-height: calc(1.25 / 0.875);\n  --text-lg: 1.125rem;\n  --text-lg--line-height: calc(1.75 / 1.125);\n  --font-weight-medium: 500;\n  --font-weight-semibold: 600;\n  --font-weight-bold: 700;\n  --blur-xl: 24px;\n  --default-font-family: var(--t3-font-sans);\n  --default-mono-font-family: var(--t3-font-mono);\n}\n*, ::after, ::before, ::backdrop, ::file-selector-button {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  border: 0 solid;\n}\nhtml, :host {\n  line-height: 1.5;\n  -webkit-text-size-adjust: 100%;\n  tab-size: 4;\n  font-family: var(--default-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji');\n  font-feature-settings: var(--default-font-feature-settings, normal);\n  font-variation-settings: var(--default-font-variation-settings, normal);\n  -webkit-tap-highlight-color: transparent;\n}\nhr {\n  height: 0;\n  color: inherit;\n  border-top-width: 1px;\n}\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n  text-decoration: underline dotted;\n}\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\na {\n  color: inherit;\n  -webkit-text-decoration: inherit;\n  text-decoration: inherit;\n}\nb, strong {\n  font-weight: bolder;\n}\ncode, kbd, samp, pre {\n  font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);\n  font-feature-settings: var(--default-mono-font-feature-settings, normal);\n  font-variation-settings: var(--default-mono-font-variation-settings, normal);\n  font-size: 1em;\n}\nsmall {\n  font-size: 80%;\n}\nsub, sup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\nsub {\n  bottom: -0.25em;\n}\nsup {\n  top: -0.5em;\n}\ntable {\n  text-indent: 0;\n  border-color: inherit;\n  border-collapse: collapse;\n}\n:-moz-focusring:where(:not(iframe)) {\n  outline: auto;\n}\nprogress {\n  vertical-align: baseline;\n}\nsummary {\n  display: list-item;\n}\nol, ul, menu {\n  list-style: none;\n}\nimg, svg, video, canvas, audio, iframe, embed, object {\n  display: block;\n  vertical-align: middle;\n}\nimg, video {\n  max-width: 100%;\n  height: auto;\n}\nbutton, input, select, optgroup, textarea, ::file-selector-button {\n  font: inherit;\n  font-feature-settings: inherit;\n  font-variation-settings: inherit;\n  letter-spacing: inherit;\n  color: inherit;\n  border-radius: 0;\n  background-color: transparent;\n  opacity: 1;\n}\n:where(select:is([multiple], [size])) optgroup {\n  font-weight: bolder;\n}\n:where(select:is([multiple], [size])) optgroup option {\n  padding-inline-start: 20px;\n}\n::file-selector-button {\n  margin-inline-end: 4px;\n}\n::placeholder {\n  opacity: 1;\n}\n@supports (not (-webkit-appearance: -apple-pay-button))  or (contain-intrinsic-size: 1px) {\n  ::placeholder {\n    color: currentcolor;\n    @supports (color: color-mix(in lab, red, red)) {\n      color: color-mix(in oklab, currentcolor 50%, transparent);\n    }\n  }\n}\ntextarea {\n  resize: vertical;\n}\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n::-webkit-date-and-time-value {\n  min-height: 1lh;\n  text-align: inherit;\n}\n::-webkit-datetime-edit {\n  display: inline-flex;\n}\n::-webkit-datetime-edit-fields-wrapper {\n  padding: 0;\n}\n::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {\n  padding-block: 0;\n}\n::-webkit-calendar-picker-indicator {\n  line-height: 1;\n}\n:-moz-ui-invalid {\n  box-shadow: none;\n}\nbutton, input:where([type='button'], [type='reset'], [type='submit']), ::file-selector-button {\n  appearance: button;\n}\n::-webkit-inner-spin-button, ::-webkit-outer-spin-button {\n  height: auto;\n}\n[hidden]:where(:not([hidden='until-found'])) {\n  display: none !important;\n}\n.pointer-events-auto {\n  pointer-events: auto;\n}\n.pointer-events-none {\n  pointer-events: none;\n}\n.absolute {\n  position: absolute;\n}\n.fixed {\n  position: fixed;\n}\n.inset-0 {\n  inset: 0px;\n}\n.top-1\\/2 {\n  top: calc(1 / 2 * 100%);\n}\n.top-2\\.5 {\n  top: calc(var(--spacing) * 2.5);\n}\n.right-2 {\n  right: calc(var(--spacing) * 2);\n}\n.left-1\\/2 {\n  left: calc(1 / 2 * 100%);\n}\n.z-1 {\n  z-index: 1;\n}\n.block {\n  display: block;\n}\n.flex {\n  display: flex;\n}\n.grid {\n  display: grid;\n}\n.hidden {\n  display: none;\n}\n.inline-flex {\n  display: inline-flex;\n}\n.h-7 {\n  height: calc(var(--spacing) * 7);\n}\n.h-8 {\n  height: calc(var(--spacing) * 8);\n}\n.max-h-24 {\n  max-height: calc(var(--spacing) * 24);\n}\n.max-h-\\[calc\\(100vh-16px\\)\\] {\n  max-height: calc(100vh - 16px);\n}\n.max-h-\\[min\\(176px\\,calc\\(100vh-180px\\)\\)\\] {\n  max-height: min(176px, calc(100vh - 180px));\n}\n.min-h-7 {\n  min-height: calc(var(--spacing) * 7);\n}\n.min-h-8 {\n  min-height: calc(var(--spacing) * 8);\n}\n.w-6 {\n  width: calc(var(--spacing) * 6);\n}\n.w-8 {\n  width: calc(var(--spacing) * 8);\n}\n.w-\\[min\\(360px\\,calc\\(100vw-16px\\)\\)\\] {\n  width: min(360px, calc(100vw - 16px));\n}\n.w-full {\n  width: 100%;\n}\n.max-w-70 {\n  max-width: calc(var(--spacing) * 70);\n}\n.min-w-0 {\n  min-width: 0px;\n}\n.flex-1 {\n  flex: 1;\n}\n.shrink-0 {\n  flex-shrink: 0;\n}\n.-translate-x-1\\/2 {\n  --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);\n  translate: var(--tw-translate-x) var(--tw-translate-y);\n}\n.-translate-y-1\\/2 {\n  --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);\n  translate: var(--tw-translate-x) var(--tw-translate-y);\n}\n.cursor-grab {\n  cursor: grab;\n}\n.cursor-pointer {\n  cursor: pointer;\n}\n.resize {\n  resize: both;\n}\n.resize-none {\n  resize: none;\n}\n.appearance-none {\n  appearance: none;\n}\n.grid-cols-\\[22px_minmax\\(0\\,1fr\\)\\] {\n  grid-template-columns: 22px minmax(0,1fr);\n}\n.grid-cols-\\[82px_minmax\\(0\\,1fr\\)\\] {\n  grid-template-columns: 82px minmax(0,1fr);\n}\n.flex-col {\n  flex-direction: column;\n}\n.items-center {\n  align-items: center;\n}\n.items-start {\n  align-items: flex-start;\n}\n.justify-center {\n  justify-content: center;\n}\n.gap-0\\.5 {\n  gap: calc(var(--spacing) * 0.5);\n}\n.gap-1 {\n  gap: var(--spacing);\n}\n.gap-2 {\n  gap: calc(var(--spacing) * 2);\n}\n.overflow-auto {\n  overflow: auto;\n}\n.overflow-hidden {\n  overflow: hidden;\n}\n.overflow-y-hidden {\n  overflow-y: hidden;\n}\n.rounded-lg {\n  border-radius: var(--t3-radius);\n}\n.rounded-md {\n  border-radius: calc(var(--t3-radius) - 2px);\n}\n.rounded-xl {\n  border-radius: calc(var(--t3-radius) + 4px);\n}\n.border {\n  border-style: var(--tw-border-style);\n  border-width: 1px;\n}\n.border-0 {\n  border-style: var(--tw-border-style);\n  border-width: 0px;\n}\n.border-t {\n  border-top-style: var(--tw-border-style);\n  border-top-width: 1px;\n}\n.border-b {\n  border-bottom-style: var(--tw-border-style);\n  border-bottom-width: 1px;\n}\n.border-border {\n  border-color: var(--t3-border);\n}\n.border-input {\n  border-color: var(--t3-input);\n}\n.border-primary {\n  border-color: var(--t3-primary);\n}\n.border-transparent {\n  border-color: transparent;\n}\n.border-b-transparent {\n  border-bottom-color: transparent;\n}\n.bg-background {\n  background-color: var(--t3-background);\n}\n.bg-muted {\n  background-color: var(--t3-muted);\n}\n.bg-muted\\/40 {\n  background-color: var(--t3-muted);\n  @supports (color: color-mix(in lab, red, red)) {\n    background-color: color-mix(in oklab, var(--t3-muted) 40%, transparent);\n  }\n}\n.bg-popover\\/95 {\n  background-color: var(--t3-popover);\n  @supports (color: color-mix(in lab, red, red)) {\n    background-color: color-mix(in oklab, var(--t3-popover) 95%, transparent);\n  }\n}\n.bg-popover\\/96 {\n  background-color: var(--t3-popover);\n  @supports (color: color-mix(in lab, red, red)) {\n    background-color: color-mix(in oklab, var(--t3-popover) 96%, transparent);\n  }\n}\n.bg-primary {\n  background-color: var(--t3-primary);\n}\n.bg-primary\\/10 {\n  background-color: var(--t3-primary);\n  @supports (color: color-mix(in lab, red, red)) {\n    background-color: color-mix(in oklab, var(--t3-primary) 10%, transparent);\n  }\n}\n.bg-transparent {\n  background-color: transparent;\n}\n.p-0 {\n  padding: 0px;\n}\n.p-1 {\n  padding: var(--spacing);\n}\n.p-2 {\n  padding: calc(var(--spacing) * 2);\n}\n.px-0 {\n  padding-inline: 0px;\n}\n.px-1 {\n  padding-inline: var(--spacing);\n}\n.px-2 {\n  padding-inline: calc(var(--spacing) * 2);\n}\n.px-2\\.5 {\n  padding-inline: calc(var(--spacing) * 2.5);\n}\n.px-3 {\n  padding-inline: calc(var(--spacing) * 3);\n}\n.py-1 {\n  padding-block: var(--spacing);\n}\n.py-1\\.5 {\n  padding-block: calc(var(--spacing) * 1.5);\n}\n.py-2 {\n  padding-block: calc(var(--spacing) * 2);\n}\n.font-mono {\n  font-family: var(--t3-font-mono);\n}\n.font-sans {\n  font-family: var(--t3-font-sans);\n}\n.text-lg {\n  font-size: var(--text-lg);\n  line-height: var(--tw-leading, var(--text-lg--line-height));\n}\n.text-sm {\n  font-size: var(--text-sm);\n  line-height: var(--tw-leading, var(--text-sm--line-height));\n}\n.text-xs {\n  font-size: var(--text-xs);\n  line-height: var(--tw-leading, var(--text-xs--line-height));\n}\n.leading-5 {\n  --tw-leading: calc(var(--spacing) * 5);\n  line-height: calc(var(--spacing) * 5);\n}\n.font-bold {\n  --tw-font-weight: var(--font-weight-bold);\n  font-weight: var(--font-weight-bold);\n}\n.font-medium {\n  --tw-font-weight: var(--font-weight-medium);\n  font-weight: var(--font-weight-medium);\n}\n.font-semibold {\n  --tw-font-weight: var(--font-weight-semibold);\n  font-weight: var(--font-weight-semibold);\n}\n.text-foreground {\n  color: var(--t3-foreground);\n}\n.text-muted-foreground {\n  color: var(--t3-muted-foreground);\n}\n.text-popover-foreground {\n  color: var(--t3-popover-foreground);\n}\n.text-primary {\n  color: var(--t3-primary);\n}\n.text-primary-foreground {\n  color: var(--t3-primary-foreground);\n}\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px var(--tw-shadow-color, rgb(0 0 0 / 0.25));\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.shadow-md {\n  --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 2px 4px -2px var(--tw-shadow-color, rgb(0 0 0 / 0.1));\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.shadow-sm {\n  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.shadow-xs {\n  --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05));\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.ring-0 {\n  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.blur {\n  --tw-blur: blur(8px);\n  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);\n}\n.backdrop-blur-xl {\n  --tw-backdrop-blur: blur(var(--blur-xl));\n  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);\n  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);\n}\n.outline-none {\n  --tw-outline-style: none;\n  outline-style: none;\n}\n.select-none {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.placeholder\\:text-muted-foreground::placeholder {\n  color: var(--t3-muted-foreground);\n}\n@media (hover: hover) {\n  .hover\\:bg-accent:hover {\n    background-color: var(--t3-accent);\n  }\n  .hover\\:bg-primary\\/90:hover {\n    background-color: var(--t3-primary);\n  }\n  @supports (color: color-mix(in lab, red, red)) {\n    .hover\\:bg-primary\\/90:hover {\n      background-color: color-mix(in oklab, var(--t3-primary) 90%, transparent);\n    }\n  }\n  .hover\\:text-accent-foreground:hover {\n    color: var(--t3-accent-foreground);\n  }\n}\n.focus\\:border-b-primary:focus {\n  border-bottom-color: var(--t3-primary);\n}\n.focus\\:ring-0:focus {\n  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);\n  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n.focus\\:outline-none:focus {\n  --tw-outline-style: none;\n  outline-style: none;\n}\n.disabled\\:pointer-events-none:disabled {\n  pointer-events: none;\n}\n.disabled\\:opacity-60:disabled {\n  opacity: 60%;\n}\n:host {\n  --t3-font-sans: \"DM Sans Variable\", \"DM Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", system-ui,\n    sans-serif;\n  --t3-font-mono: \"SF Mono\", \"SFMono-Regular\", \"JetBrains Mono\", Consolas, \"Liberation Mono\", Menlo, monospace;\n  --t3-radius: 0.625rem;\n  --t3-background: white;\n  --t3-foreground: oklch(0.269 0 0);\n  --t3-popover: white;\n  --t3-popover-foreground: oklch(0.269 0 0);\n  --t3-primary: oklch(0.488 0.217 264);\n  --t3-primary-foreground: white;\n  --t3-muted: rgb(0 0 0 / 4%);\n  --t3-muted-foreground: oklch(0.556 0 0);\n  --t3-accent: rgb(0 0 0 / 4%);\n  --t3-accent-foreground: oklch(0.269 0 0);\n  --t3-border: rgb(0 0 0 / 8%);\n  --t3-input: rgb(0 0 0 / 10%);\n  --t3-ring: oklch(0.488 0.217 264);\n  color: var(--t3-foreground);\n  font-family: var(--t3-font-sans);\n}\n* {\n  box-sizing: border-box;\n  border-color: var(--t3-border);\n}\nbutton, input, select, textarea {\n  font: inherit;\n}\nbutton:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {\n  outline: 2px solid var(--t3-ring);\n  @supports (color: color-mix(in lab, red, red)) {\n    outline: 2px solid color-mix(in srgb, var(--t3-ring) 72%, transparent);\n  }\n  outline-offset: 1px;\n}\n@property --tw-translate-x {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-translate-y {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-translate-z {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-border-style {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-leading {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-font-weight {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-shadow-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-shadow-alpha {\n  syntax: \"<percentage>\";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-inset-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-shadow-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-inset-shadow-alpha {\n  syntax: \"<percentage>\";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-ring-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-ring-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-ring-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-inset-ring-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-ring-inset {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-ring-offset-width {\n  syntax: \"<length>\";\n  inherits: false;\n  initial-value: 0px;\n}\n@property --tw-ring-offset-color {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: #fff;\n}\n@property --tw-ring-offset-shadow {\n  syntax: \"*\";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-blur {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-brightness {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-contrast {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-grayscale {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-hue-rotate {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-invert {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-opacity {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-saturate {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-sepia {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-drop-shadow {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-drop-shadow-color {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-drop-shadow-alpha {\n  syntax: \"<percentage>\";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-drop-shadow-size {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-blur {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-brightness {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-contrast {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-grayscale {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-hue-rotate {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-invert {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-opacity {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-saturate {\n  syntax: \"*\";\n  inherits: false;\n}\n@property --tw-backdrop-sepia {\n  syntax: \"*\";\n  inherits: false;\n}\n@layer properties {\n  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {\n    *, ::before, ::after, ::backdrop {\n      --tw-translate-x: 0;\n      --tw-translate-y: 0;\n      --tw-translate-z: 0;\n      --tw-border-style: solid;\n      --tw-leading: initial;\n      --tw-font-weight: initial;\n      --tw-shadow: 0 0 #0000;\n      --tw-shadow-color: initial;\n      --tw-shadow-alpha: 100%;\n      --tw-inset-shadow: 0 0 #0000;\n      --tw-inset-shadow-color: initial;\n      --tw-inset-shadow-alpha: 100%;\n      --tw-ring-color: initial;\n      --tw-ring-shadow: 0 0 #0000;\n      --tw-inset-ring-color: initial;\n      --tw-inset-ring-shadow: 0 0 #0000;\n      --tw-ring-inset: initial;\n      --tw-ring-offset-width: 0px;\n      --tw-ring-offset-color: #fff;\n      --tw-ring-offset-shadow: 0 0 #0000;\n      --tw-blur: initial;\n      --tw-brightness: initial;\n      --tw-contrast: initial;\n      --tw-grayscale: initial;\n      --tw-hue-rotate: initial;\n      --tw-invert: initial;\n      --tw-opacity: initial;\n      --tw-saturate: initial;\n      --tw-sepia: initial;\n      --tw-drop-shadow: initial;\n      --tw-drop-shadow-color: initial;\n      --tw-drop-shadow-alpha: 100%;\n      --tw-drop-shadow-size: initial;\n      --tw-backdrop-blur: initial;\n      --tw-backdrop-brightness: initial;\n      --tw-backdrop-contrast: initial;\n      --tw-backdrop-grayscale: initial;\n      --tw-backdrop-hue-rotate: initial;\n      --tw-backdrop-invert: initial;\n      --tw-backdrop-opacity: initial;\n      --tw-backdrop-saturate: initial;\n      --tw-backdrop-sepia: initial;\n    }\n  }\n}\n";
//#endregion
//#region src/preview/GuestProtocol.ts
const START_PICK_CHANNEL = "preview:start-pick";
const CANCEL_PICK_CHANNEL = "preview:cancel-pick";
const ELEMENT_PICKED_CHANNEL = "preview:element-picked";
const ANNOTATION_CAPTURED_CHANNEL = "preview:annotation-captured";
const ANNOTATION_THEME_CHANNEL = "preview:annotation-theme";
const HUMAN_INPUT_CHANNEL = "preview:human-input";
//#endregion
//#region src/preview/PickPreload.ts
const OVERLAY_ATTRIBUTE = "data-t3code-annotation-ui";
const Z_INDEX_OVERLAY = 2147483646;
const PRIMARY = "var(--t3-primary)";
const PRIMARY_FILL = "color-mix(in srgb, var(--t3-primary) 10%, transparent)";
const MAX_MARQUEE_ELEMENTS = 20;
const CONTENT_LAYER_Z_INDEX = 1;
const CHROME_LAYER_Z_INDEX = 10;
let activeSession = null;
let idSequence = 0;
let annotationTheme = null;
const applyAnnotationTheme = (host, theme) => {
	if (!theme) return;
	host.style.colorScheme = theme.colorScheme;
	const variables = {
		"--t3-radius": theme.radius,
		"--t3-background": theme.background,
		"--t3-foreground": theme.foreground,
		"--t3-popover": theme.popover,
		"--t3-popover-foreground": theme.popoverForeground,
		"--t3-primary": theme.primary,
		"--t3-primary-foreground": theme.primaryForeground,
		"--t3-muted": theme.muted,
		"--t3-muted-foreground": theme.mutedForeground,
		"--t3-accent": theme.accent,
		"--t3-accent-foreground": theme.accentForeground,
		"--t3-border": theme.border,
		"--t3-input": theme.input,
		"--t3-ring": theme.ring,
		"--t3-font-sans": theme.fontSans,
		"--t3-font-mono": theme.fontMono
	};
	for (const [name, value] of Object.entries(variables)) host.style.setProperty(name, value);
};
const reportHumanPointerInput = (event) => {
	if (!event.isTrusted) return;
	electron.ipcRenderer.send(HUMAN_INPUT_CHANNEL, {
		kind: "pointer",
		x: event.clientX,
		y: event.clientY,
		button: event.button
	});
};
const reportHumanKeyInput = (event) => {
	if (!event.isTrusted) return;
	electron.ipcRenderer.send(HUMAN_INPUT_CHANNEL, {
		kind: "key",
		key: event.key,
		code: event.code
	});
};
window.addEventListener("pointerdown", reportHumanPointerInput, true);
window.addEventListener("keydown", reportHumanKeyInput, true);
const nextId = (prefix) => {
	idSequence += 1;
	return `${prefix}_${idSequence.toString(36)}`;
};
const rectFromDomRect = (rect) => ({
	x: rect.left,
	y: rect.top,
	width: rect.width,
	height: rect.height
});
const normalizeRect = (startX, startY, endX, endY) => ({
	x: Math.min(startX, endX),
	y: Math.min(startY, endY),
	width: Math.abs(endX - startX),
	height: Math.abs(endY - startY)
});
const isUsableRect = (rect) => rect.width >= 3 && rect.height >= 3;
function unionRects(rects, padding = 20) {
	if (rects.length === 0) return null;
	const left = Math.min(...rects.map((rect) => rect.x));
	const top = Math.min(...rects.map((rect) => rect.y));
	const right = Math.max(...rects.map((rect) => rect.x + rect.width));
	const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
	const x = Math.max(0, left - padding);
	const y = Math.max(0, top - padding);
	const maxWidth = Math.max(1, window.innerWidth - x);
	const maxHeight = Math.max(1, window.innerHeight - y);
	return {
		x,
		y,
		width: Math.min(maxWidth, right - left + padding * 2),
		height: Math.min(maxHeight, bottom - top + padding * 2)
	};
}
function isAnnotationNode(element) {
	return element instanceof Element && element.closest(`[${OVERLAY_ATTRIBUTE}]`) !== null;
}
function pickFromPoint(clientX, clientY) {
	for (const candidate of document.elementsFromPoint(clientX, clientY)) {
		if (!(candidate instanceof Element)) continue;
		if (isAnnotationNode(candidate)) continue;
		if (candidate === document.documentElement || candidate === document.body) continue;
		return candidate;
	}
	return null;
}
function describeRawElement(element) {
	return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element instanceof HTMLElement && typeof element.className === "string" ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((name) => `.${name}`).join("") : ""}`;
}
function createBox(color, fill) {
	const node = document.createElement("div");
	node.setAttribute(OVERLAY_ATTRIBUTE, "");
	node.style.cssText = [
		"position:fixed",
		"pointer-events:none",
		`border:2px solid ${color}`,
		`background:${fill}`,
		"border-radius:3px",
		"box-sizing:border-box",
		"display:none",
		`z-index:${CONTENT_LAYER_Z_INDEX}`
	].join(";");
	return node;
}
function positionBox(node, rect) {
	node.style.display = "block";
	node.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
	node.style.width = `${rect.width}px`;
	node.style.height = `${rect.height}px`;
}
function createLabel() {
	const label = document.createElement("div");
	label.setAttribute(OVERLAY_ATTRIBUTE, "");
	label.className = "fixed z-1 max-w-70 overflow-hidden rounded-md bg-primary px-2 py-1 font-sans text-xs font-semibold text-primary-foreground shadow-md";
	label.style.cssText = [
		"position:fixed",
		"pointer-events:none",
		"white-space:nowrap",
		"text-overflow:ellipsis",
		`z-index:${CONTENT_LAYER_Z_INDEX}`
	].join(";");
	return label;
}
function updateSelectedVisual(target) {
	if (!target.element.isConnected) {
		target.outline.style.display = "none";
		target.label.style.display = "none";
		return;
	}
	const rect = target.element.getBoundingClientRect();
	positionBox(target.outline, rectFromDomRect(rect));
	target.label.textContent = describeRawElement(target.element);
	target.label.style.display = "block";
	target.label.style.transform = `translate(${Math.max(4, rect.left)}px, ${Math.max(4, rect.top - 22)}px)`;
}
function toStackFrame(frame) {
	return {
		functionName: frame.functionName ?? null,
		fileName: frame.fileName ?? null,
		lineNumber: frame.lineNumber ?? null,
		columnNumber: frame.columnNumber ?? null
	};
}
async function captureElement(element) {
	try {
		const context = await H(element);
		const stack = (context.stack ?? []).map(toStackFrame);
		return {
			pageUrl: location.href,
			pageTitle: document.title?.trim() || null,
			tagName: element.tagName.toLowerCase(),
			selector: context.selector,
			htmlPreview: context.htmlPreview ?? "",
			componentName: context.componentName,
			source: stack[0] ?? null,
			stack,
			styles: context.styles ?? "",
			pickedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch {
		return null;
	}
}
function createButton(label, title) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	button.title = title;
	button.className = "inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-transparent px-2 font-sans text-xs font-medium text-foreground outline-none hover:bg-accent disabled:pointer-events-none disabled:opacity-60";
	return button;
}
function styleControl(input) {
	input.setAttribute("aria-label", input.getAttribute("aria-label") ?? "Style value");
	input.className = "h-7 min-w-0 w-full appearance-none rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground shadow-xs outline-none";
}
function createUnitControl(input) {
	const wrapper = document.createElement("div");
	wrapper.style.cssText = "position:relative;min-width:0";
	const unit = document.createElement("span");
	unit.textContent = input.dataset.unit ?? "";
	unit.className = "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-xs text-muted-foreground";
	wrapper.append(input, unit);
	return wrapper;
}
function createField(labelText, input) {
	const label = document.createElement("label");
	label.className = "grid min-h-7 grid-cols-[82px_minmax(0,1fr)] items-center gap-2 font-sans text-xs font-medium text-muted-foreground";
	const text = document.createElement("span");
	text.textContent = labelText;
	styleControl(input);
	label.append(text, input instanceof HTMLInputElement && input.dataset.unit ? createUnitControl(input) : input);
	return label;
}
function createStyleSection() {
	const section = document.createElement("section");
	section.className = "grid gap-1 border-t border-border py-2";
	return section;
}
function createUnitInput(unit, placeholder = "0") {
	const input = document.createElement("input");
	input.type = "number";
	input.placeholder = placeholder;
	input.style.paddingRight = "30px";
	input.dataset.unit = unit;
	return input;
}
function pathFromPoints(points) {
	if (points.length === 0) return "";
	if (points.length === 1) return `M ${points[0].x} ${points[0].y} l 0.01 0.01`;
	let path = `M ${points[0].x} ${points[0].y}`;
	for (let index = 1; index < points.length - 1; index += 1) {
		const current = points[index];
		const next = points[index + 1];
		path += ` Q ${current.x} ${current.y} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
	}
	const last = points[points.length - 1];
	path += ` L ${last.x} ${last.y}`;
	return path;
}
function strokeBounds(points, width) {
	const xs = points.map((point) => point.x);
	const ys = points.map((point) => point.y);
	const padding = width + 3;
	const left = Math.min(...xs) - padding;
	const top = Math.min(...ys) - padding;
	const right = Math.max(...xs) + padding;
	const bottom = Math.max(...ys) + padding;
	return {
		x: left,
		y: top,
		width: right - left,
		height: bottom - top
	};
}
function startAnnotation() {
	activeSession?.teardown(false);
	let finished = false;
	const host = document.createElement("div");
	host.setAttribute(OVERLAY_ATTRIBUTE, "");
	host.style.cssText = `position:fixed;inset:0;z-index:${Z_INDEX_OVERLAY};pointer-events:none`;
	applyAnnotationTheme(host, annotationTheme);
	const shadowRoot = host.attachShadow({ mode: "closed" });
	const themeStyle = document.createElement("style");
	themeStyle.textContent = previewAnnotationStyles;
	shadowRoot.appendChild(themeStyle);
	const root = document.createElement("div");
	root.setAttribute(OVERLAY_ATTRIBUTE, "");
	root.className = "fixed inset-0 font-sans text-foreground";
	root.style.cssText = "pointer-events:none";
	const cursorStyle = document.createElement("style");
	cursorStyle.setAttribute(OVERLAY_ATTRIBUTE, "");
	cursorStyle.textContent = `html[data-t3code-annotation-tool] body, html[data-t3code-annotation-tool] body * { cursor: crosshair !important; } [${OVERLAY_ATTRIBUTE}], [${OVERLAY_ATTRIBUTE}] * { cursor: default !important; } [${OVERLAY_ATTRIBUTE}] input[type=number]::-webkit-inner-spin-button, [${OVERLAY_ATTRIBUTE}] input[type=number]::-webkit-outer-spin-button { appearance:none; margin:0; }`;
	document.documentElement.appendChild(cursorStyle);
	shadowRoot.appendChild(root);
	const hoverOutline = createBox(PRIMARY, PRIMARY_FILL);
	const marqueeBox = createBox(PRIMARY, PRIMARY_FILL);
	root.append(hoverOutline, marqueeBox);
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute(OVERLAY_ATTRIBUTE, "");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
	svg.style.cssText = "position:fixed;inset:0;overflow:visible;pointer-events:none";
	svg.style.zIndex = String(CONTENT_LAYER_Z_INDEX);
	root.appendChild(svg);
	const toolbar = document.createElement("div");
	toolbar.setAttribute(OVERLAY_ATTRIBUTE, "");
	toolbar.className = "pointer-events-auto fixed top-2.5 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border border-border bg-popover/95 p-1 text-popover-foreground shadow-lg backdrop-blur-xl";
	toolbar.style.zIndex = String(CHROME_LAYER_Z_INDEX);
	root.appendChild(toolbar);
	const editor = document.createElement("div");
	editor.setAttribute(OVERLAY_ATTRIBUTE, "");
	editor.className = "pointer-events-auto fixed hidden max-h-[calc(100vh-16px)] w-[min(360px,calc(100vw-16px))] flex-col overflow-hidden rounded-xl border border-border bg-popover/96 text-popover-foreground shadow-2xl backdrop-blur-xl";
	editor.style.zIndex = String(CHROME_LAYER_Z_INDEX);
	root.appendChild(editor);
	const composerRow = document.createElement("div");
	composerRow.className = "flex items-start gap-2 p-2";
	const adjust = createButton("", "Expand annotation editor");
	adjust.setAttribute("aria-label", "Expand annotation editor");
	adjust.setAttribute("aria-expanded", "false");
	adjust.className += " h-8 w-8 shrink-0 bg-muted p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground";
	adjust.innerHTML = "<svg viewBox=\"0 0 20 20\" width=\"15\" height=\"15\" aria-hidden=\"true\"><path d=\"M4 5h12M4 10h12M4 15h12M7 3v4M13 8v4M9 13v4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>";
	composerRow.appendChild(adjust);
	const comment = document.createElement("textarea");
	comment.placeholder = "Describe the change…";
	comment.rows = 1;
	comment.className = "min-h-8 max-h-24 min-w-0 flex-1 resize-none overflow-y-hidden border-0 border-b border-b-transparent bg-transparent px-0 py-1.5 font-sans text-sm leading-5 text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-b-primary focus:outline-none focus:ring-0";
	composerRow.appendChild(comment);
	const dragHandle = document.createElement("button");
	dragHandle.type = "button";
	dragHandle.textContent = "⠿";
	dragHandle.title = "Drag annotation editor";
	dragHandle.className = "hidden h-8 w-6 shrink-0 cursor-grab select-none border-0 bg-transparent p-0 font-sans text-lg font-bold leading-5 text-muted-foreground";
	composerRow.appendChild(dragHandle);
	const submit = createButton("Attach", "Attach annotation and screenshot (Enter)");
	submit.className += " h-8 shrink-0 border-primary bg-primary px-3 text-primary-foreground shadow-sm hover:bg-primary/90";
	composerRow.appendChild(submit);
	editor.appendChild(composerRow);
	const stylePanel = document.createElement("div");
	stylePanel.className = "hidden max-h-[min(176px,calc(100vh-180px))] overflow-auto border-t border-border bg-muted/40 px-3";
	editor.appendChild(stylePanel);
	const selected = /* @__PURE__ */ new Map();
	const regions = [];
	const strokes = [];
	const styleChanges = /* @__PURE__ */ new Map();
	const toolButtons = /* @__PURE__ */ new Map();
	let tool = "select";
	let dragStart = null;
	let activeStroke = null;
	let pendingCapture = false;
	let editorExpanded = false;
	let editorWasShown = false;
	let editorPosition = null;
	let editorDrag = null;
	let editorLayoutFrame = null;
	const resizeComment = () => {
		const maxHeight = 96;
		comment.style.height = "auto";
		const nextHeight = Math.min(comment.scrollHeight, maxHeight);
		comment.style.height = `${nextHeight}px`;
		comment.style.overflowY = comment.scrollHeight > maxHeight ? "auto" : "hidden";
		queueEditorLayout();
	};
	comment.addEventListener("input", resizeComment);
	const updateStatus = () => {
		const hasTargets = selected.size > 0 || regions.length > 0 || strokes.length > 0;
		editor.style.display = hasTargets ? "flex" : "none";
		submit.disabled = !hasTargets;
		submit.style.opacity = hasTargets ? "1" : "0.45";
		adjust.disabled = !hasTargets;
		stylePanel.style.display = editorExpanded && selected.size > 0 ? "grid" : "none";
		queueEditorLayout();
		if (hasTargets && !editorWasShown) {
			editorWasShown = true;
			window.setTimeout(() => comment.focus({ preventScroll: true }), 0);
		}
	};
	const refreshToolButtons = () => {
		for (const [candidate, button] of toolButtons) {
			const active = candidate === tool;
			button.classList.toggle("bg-primary/10", active);
			button.classList.toggle("text-primary", active);
			button.classList.toggle("text-foreground", !active);
		}
		if (tool !== "select") hoverOutline.style.display = "none";
		if (tool !== "marquee") marqueeBox.style.display = "none";
		document.documentElement.setAttribute("data-t3code-annotation-tool", tool);
	};
	const removeSelected = (target) => {
		if (target.element instanceof HTMLElement || target.element instanceof SVGElement) for (const [property, baseline] of target.baselineStyles) if (baseline) target.element.style.setProperty(property, baseline);
		else target.element.style.removeProperty(property);
		selected.delete(target.element);
		target.outline.remove();
		target.label.remove();
		for (const [key, change] of styleChanges) if (change.targetId === target.id) styleChanges.delete(key);
		updateStatus();
	};
	const addSelected = (element) => {
		if (selected.has(element)) return;
		const target = {
			id: nextId("element"),
			element,
			outline: createBox(PRIMARY, PRIMARY_FILL),
			label: createLabel(),
			baselineStyles: /* @__PURE__ */ new Map()
		};
		selected.set(element, target);
		root.append(target.outline, target.label);
		updateSelectedVisual(target);
		updateStatus();
		if (editorExpanded) {
			stylePanel.style.display = "grid";
			syncStyleControls();
		}
	};
	const toggleSelected = (element, additive) => {
		const existing = selected.get(element);
		if (existing) {
			removeSelected(existing);
			return;
		}
		if (!additive) for (const target of Array.from(selected.values())) removeSelected(target);
		addSelected(element);
	};
	const setStyleForSelected = (property, value) => {
		for (const target of selected.values()) {
			if (!(target.element instanceof HTMLElement || target.element instanceof SVGElement)) continue;
			if (!target.baselineStyles.has(property)) target.baselineStyles.set(property, target.element.style.getPropertyValue(property));
			const key = `${target.id}:${property}`;
			const previousValue = styleChanges.get(key)?.previousValue ?? getComputedStyle(target.element).getPropertyValue(property).trim();
			target.element.style.setProperty(property, value, "important");
			styleChanges.set(key, {
				targetId: target.id,
				selector: null,
				property,
				previousValue,
				value
			});
			updateSelectedVisual(target);
		}
	};
	const textSection = createStyleSection();
	const colorsSection = createStyleSection();
	const bordersSection = createStyleSection();
	const sizingSection = createStyleSection();
	stylePanel.append(textSection, colorsSection, bordersSection, sizingSection);
	const fontFamily = document.createElement("select");
	for (const value of [
		"inherit",
		"system-ui",
		"sans-serif",
		"serif",
		"monospace"
	]) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = value;
		fontFamily.appendChild(option);
	}
	fontFamily.addEventListener("change", () => setStyleForSelected("font-family", fontFamily.value));
	textSection.appendChild(createField("Font", fontFamily));
	const fontSize = createUnitInput("px", "16");
	fontSize.min = "1";
	fontSize.max = "300";
	fontSize.addEventListener("input", () => {
		if (fontSize.value) setStyleForSelected("font-size", `${fontSize.value}px`);
	});
	textSection.appendChild(createField("Font size", fontSize));
	const fontWeight = document.createElement("select");
	for (const value of [
		"300",
		"400",
		"500",
		"600",
		"700",
		"800",
		"900"
	]) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = value;
		fontWeight.appendChild(option);
	}
	fontWeight.addEventListener("change", () => setStyleForSelected("font-weight", fontWeight.value));
	textSection.appendChild(createField("Font weight", fontWeight));
	const lineHeight = document.createElement("input");
	lineHeight.type = "text";
	lineHeight.placeholder = "normal / 1.4";
	lineHeight.addEventListener("change", () => {
		if (lineHeight.value.trim()) setStyleForSelected("line-height", lineHeight.value.trim());
	});
	textSection.appendChild(createField("Line height", lineHeight));
	const createColorRow = (labelText, property, section) => {
		const row = document.createElement("label");
		row.className = "grid min-h-7 grid-cols-[82px_minmax(0,1fr)] items-center gap-2 font-sans text-xs font-medium text-muted-foreground";
		const label = document.createElement("span");
		label.textContent = labelText;
		const control = document.createElement("div");
		control.className = "grid h-7 grid-cols-[22px_minmax(0,1fr)] items-center gap-1 rounded-md border border-input bg-background px-1 shadow-xs";
		const color = document.createElement("input");
		color.type = "color";
		color.setAttribute("aria-label", labelText);
		color.style.cssText = "width:20px;height:20px;padding:0;border:0;border-radius:5px;overflow:hidden;background:transparent;cursor:pointer";
		const text = document.createElement("input");
		text.type = "text";
		text.setAttribute("aria-label", `${labelText} value`);
		text.className = "min-w-0 w-full border-0 bg-transparent font-mono text-xs text-foreground outline-none";
		color.addEventListener("input", () => {
			text.value = color.value;
			setStyleForSelected(property, color.value);
		});
		text.addEventListener("change", () => {
			const value = text.value.trim();
			if (!value) return;
			setStyleForSelected(property, value);
			if (/^#[0-9a-f]{6}$/i.test(value)) color.value = value;
		});
		control.append(color, text);
		row.append(label, control);
		section.appendChild(row);
		return {
			row,
			color,
			text
		};
	};
	const textColor = createColorRow("Text color", "color", colorsSection);
	const backgroundColor = createColorRow("Background", "background-color", colorsSection);
	const opacity = document.createElement("input");
	opacity.type = "range";
	opacity.min = "0";
	opacity.max = "1";
	opacity.step = "0.05";
	opacity.value = "1";
	opacity.style.accentColor = PRIMARY;
	opacity.addEventListener("input", () => setStyleForSelected("opacity", opacity.value));
	colorsSection.appendChild(createField("Opacity", opacity));
	const radius = createUnitInput("px", "0");
	radius.min = "0";
	radius.max = "300";
	radius.addEventListener("input", () => {
		if (radius.value) setStyleForSelected("border-radius", `${radius.value}px`);
	});
	bordersSection.appendChild(createField("Radius", radius));
	const borderColor = createColorRow("Border color", "border-color", bordersSection);
	const borderWidth = createUnitInput("px", "0");
	borderWidth.min = "0";
	borderWidth.max = "100";
	borderWidth.addEventListener("input", () => {
		if (borderWidth.value) {
			setStyleForSelected("border-style", "solid");
			setStyleForSelected("border-width", `${borderWidth.value}px`);
		}
	});
	bordersSection.appendChild(createField("Border width", borderWidth));
	const dimensions = document.createElement("div");
	dimensions.style.cssText = "display:grid;grid-template-columns:82px minmax(0,1fr);gap:8px;align-items:center";
	const dimensionLabel = document.createElement("div");
	dimensionLabel.className = "grid gap-2 font-sans text-xs font-medium text-muted-foreground";
	dimensionLabel.innerHTML = "<span>Width</span><span>Height</span>";
	const dimensionControls = document.createElement("div");
	dimensionControls.style.cssText = "position:relative;display:grid;gap:3px;padding-left:22px";
	const widthInput = createUnitInput("px", "auto");
	const heightInput = createUnitInput("px", "auto");
	styleControl(widthInput);
	styleControl(heightInput);
	const aspectLock = createButton("", "Lock aspect ratio");
	aspectLock.setAttribute("aria-pressed", "true");
	aspectLock.style.cssText += ";position:absolute;left:0;top:50%;transform:translateY(-50%);width:18px;height:38px;padding:0";
	aspectLock.className += " bg-primary/10 text-primary";
	dimensionControls.append(createUnitControl(widthInput), createUnitControl(heightInput), aspectLock);
	dimensions.append(dimensionLabel, dimensionControls);
	sizingSection.appendChild(dimensions);
	let aspectLocked = true;
	let aspectRatio = 1;
	const refreshAspectButton = () => {
		aspectLock.innerHTML = aspectLocked ? "<svg viewBox=\"0 0 20 20\" width=\"14\" height=\"14\" aria-hidden=\"true\"><path d=\"M8 6.5 9.5 5A3.5 3.5 0 0 1 14.5 10l-1.5 1.5M12 13.5 10.5 15A3.5 3.5 0 0 1 5.5 10L7 8.5M7.5 12.5l5-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>" : "<svg viewBox=\"0 0 20 20\" width=\"14\" height=\"14\" aria-hidden=\"true\"><path d=\"m6 6 8 8M8 6.5 9.5 5A3.5 3.5 0 0 1 14 9M12 13.5 10.5 15A3.5 3.5 0 0 1 6 11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>";
		aspectLock.setAttribute("aria-pressed", String(aspectLocked));
		aspectLock.classList.toggle("bg-primary/10", aspectLocked);
		aspectLock.classList.toggle("text-primary", aspectLocked);
		aspectLock.classList.toggle("bg-muted", !aspectLocked);
		aspectLock.classList.toggle("text-muted-foreground", !aspectLocked);
	};
	aspectLock.addEventListener("click", () => {
		aspectLocked = !aspectLocked;
		refreshAspectButton();
	});
	widthInput.addEventListener("input", () => {
		const width = Number(widthInput.value);
		if (!Number.isFinite(width) || width <= 0) return;
		setStyleForSelected("width", `${width}px`);
		if (aspectLocked && aspectRatio > 0) {
			const height = Math.max(1, Math.round(width / aspectRatio));
			heightInput.value = String(height);
			setStyleForSelected("height", `${height}px`);
		}
	});
	heightInput.addEventListener("input", () => {
		const height = Number(heightInput.value);
		if (!Number.isFinite(height) || height <= 0) return;
		setStyleForSelected("height", `${height}px`);
		if (aspectLocked && aspectRatio > 0) {
			const width = Math.max(1, Math.round(height * aspectRatio));
			widthInput.value = String(width);
			setStyleForSelected("width", `${width}px`);
		}
	});
	refreshAspectButton();
	const addSpacingField = (label, property, placeholder) => {
		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = placeholder;
		input.addEventListener("change", () => {
			if (input.value.trim()) setStyleForSelected(property, input.value.trim());
		});
		sizingSection.appendChild(createField(label, input));
		return input;
	};
	const padding = addSpacingField("Padding", "padding", "0 0 0 0");
	const margin = addSpacingField("Margin", "margin", "0 0 0 0");
	const gap = addSpacingField("Gap", "gap", "0px");
	const syncStyleControls = () => {
		const first = selected.values().next().value;
		if (!first) return;
		const computed = getComputedStyle(first.element);
		const rect = first.element.getBoundingClientRect();
		aspectRatio = rect.height > 0 ? rect.width / rect.height : 1;
		widthInput.value = String(Math.round(rect.width));
		heightInput.value = String(Math.round(rect.height));
		fontSize.value = String(Math.round(Number.parseFloat(computed.fontSize) || 16));
		fontWeight.value = computed.fontWeight.match(/^[0-9]+$/) ? computed.fontWeight : "400";
		lineHeight.value = computed.lineHeight;
		fontFamily.value = Array.from(fontFamily.options).some((option) => option.value === computed.fontFamily) ? computed.fontFamily : "inherit";
		textColor.text.value = computed.color;
		backgroundColor.text.value = computed.backgroundColor;
		borderColor.text.value = computed.borderColor;
		opacity.value = computed.opacity;
		radius.value = String(Math.round(Number.parseFloat(computed.borderRadius) || 0));
		borderWidth.value = String(Math.round(Number.parseFloat(computed.borderWidth) || 0));
		padding.value = computed.padding;
		margin.value = computed.margin;
		gap.value = computed.gap === "normal" ? "0px" : computed.gap;
	};
	for (const [candidate, label, title] of [
		[
			"select",
			"Select",
			"Select elements (V)"
		],
		[
			"marquee",
			"Region",
			"Draw a region or marquee-select elements (R)"
		],
		[
			"draw",
			"Draw",
			"Draw freehand (D)"
		],
		[
			"erase",
			"Erase",
			"Remove an annotation target (E)"
		]
	]) {
		const button = createButton(label, title);
		button.className += " h-8 px-2.5 text-sm";
		button.addEventListener("click", () => {
			tool = candidate;
			refreshToolButtons();
		});
		toolButtons.set(candidate, button);
		toolbar.appendChild(button);
	}
	const clampEditorPosition = (left, top) => {
		const margin = 8;
		const rect = editor.getBoundingClientRect();
		return {
			left: Math.min(Math.max(margin, left), Math.max(margin, window.innerWidth - rect.width - margin)),
			top: Math.min(Math.max(margin, top), Math.max(margin, window.innerHeight - rect.height - margin))
		};
	};
	const applyEditorPosition = (position) => {
		const clamped = clampEditorPosition(position.left, position.top);
		editor.style.left = `${clamped.left}px`;
		editor.style.top = `${clamped.top}px`;
		editor.style.right = "auto";
		editor.style.bottom = "auto";
		if (editorExpanded) editorPosition = clamped;
	};
	const getAnnotationBounds = () => unionRects([
		...Array.from(selected.values(), (target) => rectFromDomRect(target.element.getBoundingClientRect())),
		...regions.map((region) => region.rect),
		...strokes.map((stroke) => stroke.bounds)
	], 0);
	const positionCompactEditor = () => {
		const bounds = getAnnotationBounds();
		if (!bounds) return;
		const editorRect = editor.getBoundingClientRect();
		const gap = 8;
		const candidates = [
			{
				left: bounds.x + bounds.width + gap,
				top: bounds.y
			},
			{
				left: bounds.x - editorRect.width - gap,
				top: bounds.y
			},
			{
				left: bounds.x + bounds.width - editorRect.width,
				top: bounds.y + bounds.height + gap
			},
			{
				left: bounds.x + bounds.width - editorRect.width,
				top: bounds.y - editorRect.height - gap
			}
		];
		const overflow = (position) => Math.max(0, -position.left) + Math.max(0, -position.top) + Math.max(0, position.left + editorRect.width - window.innerWidth) + Math.max(0, position.top + editorRect.height - window.innerHeight);
		const best = candidates.reduce((current, candidate) => overflow(candidate) < overflow(current) ? candidate : current);
		applyEditorPosition(best);
	};
	function queueEditorLayout() {
		if (editorLayoutFrame !== null) window.cancelAnimationFrame(editorLayoutFrame);
		editorLayoutFrame = window.requestAnimationFrame(() => {
			editorLayoutFrame = null;
			if (editor.style.display === "none") return;
			if (editorExpanded && editorPosition) applyEditorPosition(editorPosition);
			else positionCompactEditor();
		});
	}
	adjust.addEventListener("click", () => {
		if (selected.size === 0) return;
		if (!editorExpanded) {
			const rect = editor.getBoundingClientRect();
			editorExpanded = true;
			editorPosition = {
				left: rect.left,
				top: rect.top
			};
			stylePanel.style.display = selected.size > 0 ? "grid" : "none";
			dragHandle.style.display = "block";
			adjust.setAttribute("aria-expanded", "true");
			adjust.title = "Collapse annotation editor";
			adjust.setAttribute("aria-label", "Collapse annotation editor");
			if (selected.size > 0) syncStyleControls();
		} else {
			editorExpanded = false;
			editorPosition = null;
			stylePanel.style.display = "none";
			dragHandle.style.display = "none";
			adjust.setAttribute("aria-expanded", "false");
			adjust.title = "Expand annotation editor";
			adjust.setAttribute("aria-label", "Expand annotation editor");
		}
		queueEditorLayout();
	});
	const onEditorPointerDown = (event) => {
		if (event.button !== 0 || !editorExpanded) return;
		const rect = editor.getBoundingClientRect();
		editorDrag = {
			pointerId: event.pointerId,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top
		};
		dragHandle.setPointerCapture(event.pointerId);
		dragHandle.style.cursor = "grabbing";
		event.preventDefault();
		event.stopPropagation();
	};
	const onEditorPointerMove = (event) => {
		if (!editorDrag || editorDrag.pointerId !== event.pointerId) return;
		applyEditorPosition({
			left: event.clientX - editorDrag.offsetX,
			top: event.clientY - editorDrag.offsetY
		});
		event.preventDefault();
		event.stopPropagation();
	};
	const onEditorPointerUp = (event) => {
		if (!editorDrag || editorDrag.pointerId !== event.pointerId) return;
		editorDrag = null;
		dragHandle.style.cursor = "grab";
		if (dragHandle.hasPointerCapture(event.pointerId)) dragHandle.releasePointerCapture(event.pointerId);
		event.preventDefault();
		event.stopPropagation();
	};
	dragHandle.addEventListener("pointerdown", onEditorPointerDown);
	dragHandle.addEventListener("pointermove", onEditorPointerMove);
	dragHandle.addEventListener("pointerup", onEditorPointerUp);
	dragHandle.addEventListener("pointercancel", onEditorPointerUp);
	const repaint = () => {
		for (const target of selected.values()) updateSelectedVisual(target);
		queueEditorLayout();
	};
	const removeTargetAtPoint = (x, y) => {
		for (const target of Array.from(selected.values()).toReversed()) {
			const rect = target.element.getBoundingClientRect();
			if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
				removeSelected(target);
				return true;
			}
		}
		const regionIndex = regions.findIndex((region) => x >= region.rect.x && x <= region.rect.x + region.rect.width && y >= region.rect.y && y <= region.rect.y + region.rect.height);
		if (regionIndex >= 0) {
			const [removed] = regions.splice(regionIndex, 1);
			root.querySelector(`[data-region-id="${removed?.id}"]`)?.remove();
			updateStatus();
			return true;
		}
		const strokeIndex = strokes.findIndex((stroke) => x >= stroke.bounds.x && x <= stroke.bounds.x + stroke.bounds.width && y >= stroke.bounds.y && y <= stroke.bounds.y + stroke.bounds.height);
		if (strokeIndex >= 0) {
			const [removed] = strokes.splice(strokeIndex, 1);
			svg.querySelector(`[data-stroke-id="${removed?.id}"]`)?.remove();
			updateStatus();
			return true;
		}
		return false;
	};
	const selectElementsInRect = (rect) => {
		const candidates = Array.from(document.querySelectorAll("body *")).filter((element) => !isAnnotationNode(element)).map((element) => ({
			element,
			rect: element.getBoundingClientRect()
		})).filter(({ rect: candidate }) => {
			if (candidate.width < 2 || candidate.height < 2) return false;
			return !(candidate.right < rect.x || candidate.left > rect.x + rect.width || candidate.bottom < rect.y || candidate.top > rect.y + rect.height);
		}).filter(({ element, rect: candidate }) => {
			const centerX = candidate.left + candidate.width / 2;
			const centerY = candidate.top + candidate.height / 2;
			return centerX >= rect.x && centerX <= rect.x + rect.width && centerY >= rect.y && centerY <= rect.y + rect.height && (element.children.length === 0 || element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement || element.getAttribute("role") === "button");
		}).sort((left, right) => left.rect.width * left.rect.height - right.rect.width * right.rect.height).slice(0, MAX_MARQUEE_ELEMENTS);
		for (const candidate of candidates) addSelected(candidate.element);
		return candidates.length;
	};
	const clearHoverOutline = () => {
		hoverOutline.style.display = "none";
	};
	const onPointerMove = (event) => {
		if (isAnnotationNode(event.target)) {
			clearHoverOutline();
			return;
		}
		if (tool === "select" && dragStart === null) {
			const target = pickFromPoint(event.clientX, event.clientY);
			if (target) positionBox(hoverOutline, rectFromDomRect(target.getBoundingClientRect()));
			else clearHoverOutline();
			return;
		}
		clearHoverOutline();
		if (tool === "marquee" && dragStart) {
			positionBox(marqueeBox, normalizeRect(dragStart.x, dragStart.y, event.clientX, event.clientY));
			return;
		}
		if (tool === "draw" && activeStroke) {
			activeStroke.target.points = [...activeStroke.target.points, {
				x: event.clientX,
				y: event.clientY
			}];
			activeStroke.target.bounds = strokeBounds(activeStroke.target.points, activeStroke.target.width);
			activeStroke.path.setAttribute("d", pathFromPoints(activeStroke.target.points));
		}
	};
	const onPointerDown = (event) => {
		if (event.button !== 0 || isAnnotationNode(event.target)) return;
		event.preventDefault();
		event.stopPropagation();
		if (tool === "select") {
			const target = pickFromPoint(event.clientX, event.clientY);
			if (target) toggleSelected(target, event.shiftKey);
			return;
		}
		if (tool === "erase") {
			removeTargetAtPoint(event.clientX, event.clientY);
			return;
		}
		dragStart = {
			x: event.clientX,
			y: event.clientY
		};
		if (tool === "draw") {
			const stroke = {
				id: nextId("stroke"),
				color: annotationTheme?.primary ?? "#2563eb",
				width: 4,
				points: [dragStart],
				bounds: {
					x: dragStart.x,
					y: dragStart.y,
					width: 1,
					height: 1
				}
			};
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute(OVERLAY_ATTRIBUTE, "");
			path.setAttribute("data-stroke-id", stroke.id);
			path.setAttribute("fill", "none");
			path.setAttribute("stroke", stroke.color);
			path.setAttribute("stroke-width", String(stroke.width));
			path.setAttribute("stroke-linecap", "round");
			path.setAttribute("stroke-linejoin", "round");
			svg.appendChild(path);
			activeStroke = {
				target: stroke,
				path
			};
		}
	};
	const onPointerUp = (event) => {
		if (!dragStart) return;
		event.preventDefault();
		event.stopPropagation();
		if (tool === "marquee") {
			const rect = normalizeRect(dragStart.x, dragStart.y, event.clientX, event.clientY);
			marqueeBox.style.display = "none";
			if (isUsableRect(rect)) {
				if (selectElementsInRect(rect) === 0) {
					const region = {
						id: nextId("region"),
						rect
					};
					regions.push(region);
					const regionBox = createBox(PRIMARY, "color-mix(in srgb, var(--t3-primary) 6%, transparent)");
					regionBox.setAttribute("data-region-id", region.id);
					positionBox(regionBox, rect);
					root.appendChild(regionBox);
				}
			}
		} else if (tool === "draw" && activeStroke) {
			if (activeStroke.target.points.length > 1) strokes.push(activeStroke.target);
			else activeStroke.path.remove();
			activeStroke = null;
		}
		dragStart = null;
		updateStatus();
	};
	const onClick = (event) => {
		if (isAnnotationNode(event.target)) return;
		event.preventDefault();
		event.stopPropagation();
	};
	const onPointerOut = (event) => {
		if (event.relatedTarget === null) clearHoverOutline();
	};
	const onWindowBlur = () => {
		clearHoverOutline();
	};
	const restoreStyles = () => {
		for (const target of selected.values()) {
			if (!(target.element instanceof HTMLElement || target.element instanceof SVGElement)) continue;
			for (const [property, baseline] of target.baselineStyles) if (baseline) target.element.style.setProperty(property, baseline);
			else target.element.style.removeProperty(property);
		}
	};
	const teardown = (notifyMain) => {
		if (finished) return;
		finished = true;
		restoreStyles();
		window.removeEventListener("pointermove", onPointerMove, true);
		window.removeEventListener("pointerdown", onPointerDown, true);
		window.removeEventListener("pointerup", onPointerUp, true);
		window.removeEventListener("pointerout", onPointerOut, true);
		window.removeEventListener("click", onClick, true);
		window.removeEventListener("blur", onWindowBlur);
		window.removeEventListener("keydown", onKeyDown, true);
		window.removeEventListener("scroll", repaint, true);
		window.removeEventListener("resize", repaint);
		dragHandle.removeEventListener("pointerdown", onEditorPointerDown);
		dragHandle.removeEventListener("pointermove", onEditorPointerMove);
		dragHandle.removeEventListener("pointerup", onEditorPointerUp);
		dragHandle.removeEventListener("pointercancel", onEditorPointerUp);
		if (editorLayoutFrame !== null) window.cancelAnimationFrame(editorLayoutFrame);
		electron.ipcRenderer.off(CANCEL_PICK_CHANNEL, onCancel);
		electron.ipcRenderer.off(ANNOTATION_CAPTURED_CHANNEL, onCaptured);
		document.documentElement.removeAttribute("data-t3code-annotation-tool");
		cursorStyle.remove();
		host.remove();
		activeSession = null;
		if (notifyMain) electron.ipcRenderer.send(ELEMENT_PICKED_CHANNEL, null);
	};
	const onCancel = () => teardown(false);
	const onCaptured = () => teardown(false);
	const onKeyDown = (event) => {
		if (isAnnotationNode(event.target) && event.key !== "Escape") return;
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			teardown(true);
			return;
		}
		if (event.key === "v") tool = "select";
		else if (event.key === "r") tool = "marquee";
		else if (event.key === "d") tool = "draw";
		else if (event.key === "e") tool = "erase";
		else return;
		refreshToolButtons();
	};
	const submitAnnotation = (submission) => {
		if (pendingCapture || selected.size === 0 && regions.length === 0 && strokes.length === 0) return;
		pendingCapture = true;
		submit.disabled = true;
		submit.textContent = "Capturing…";
		Promise.all(Array.from(selected.values()).map(async (target) => {
			const element = await captureElement(target.element);
			if (!element) return null;
			for (const change of styleChanges.values()) if (change.targetId === target.id) change.selector = element.selector;
			return {
				id: target.id,
				element,
				rect: rectFromDomRect(target.element.getBoundingClientRect())
			};
		})).then((captured) => {
			const elements = captured.filter((target) => target !== null);
			const annotation = {
				id: nextId("annotation"),
				pageUrl: location.href,
				pageTitle: document.title?.trim() || null,
				comment: comment.value.trim(),
				elements,
				regions: [...regions],
				strokes: [...strokes],
				styleChanges: Array.from(styleChanges.values()),
				screenshot: null,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			editor.style.display = "none";
			toolbar.style.display = "none";
			hoverOutline.style.display = "none";
			const screenshotRect = unionRects([
				...elements.map((target) => target.rect),
				...regions.map((region) => region.rect),
				...strokes.map((stroke) => stroke.bounds)
			]);
			electron.ipcRenderer.send(ELEMENT_PICKED_CHANNEL, annotation, screenshotRect, submission);
		});
	};
	submit.addEventListener("click", () => submitAnnotation("attach"));
	root.addEventListener("keydown", (event) => {
		const submission = event.target === comment ? resolveAnnotationSubmission(event) : null;
		event.stopImmediatePropagation();
		if (!submission) return;
		event.preventDefault();
		submitAnnotation(submission);
	});
	window.addEventListener("pointermove", onPointerMove, {
		capture: true,
		passive: false
	});
	window.addEventListener("pointerdown", onPointerDown, {
		capture: true,
		passive: false
	});
	window.addEventListener("pointerup", onPointerUp, {
		capture: true,
		passive: false
	});
	window.addEventListener("pointerout", onPointerOut, {
		capture: true,
		passive: true
	});
	window.addEventListener("click", onClick, {
		capture: true,
		passive: false
	});
	window.addEventListener("blur", onWindowBlur);
	window.addEventListener("keydown", onKeyDown, { capture: true });
	window.addEventListener("scroll", repaint, {
		capture: true,
		passive: true
	});
	window.addEventListener("resize", repaint, { passive: true });
	electron.ipcRenderer.on(CANCEL_PICK_CHANNEL, onCancel);
	electron.ipcRenderer.on(ANNOTATION_CAPTURED_CHANNEL, onCaptured);
	document.documentElement.appendChild(host);
	refreshToolButtons();
	updateStatus();
	activeSession = {
		teardown,
		applyTheme: (theme) => applyAnnotationTheme(host, theme)
	};
}
electron.ipcRenderer.on(START_PICK_CHANNEL, (_event, theme) => {
	if (theme) annotationTheme = theme;
	startAnnotation();
});
electron.ipcRenderer.on(ANNOTATION_THEME_CHANNEL, (_event, theme) => {
	annotationTheme = theme;
	activeSession?.applyTheme(theme);
});
electron.ipcRenderer.on(CANCEL_PICK_CHANNEL, () => activeSession?.teardown(false));
//#endregion

//# sourceMappingURL=preview-pick-preload.cjs.map