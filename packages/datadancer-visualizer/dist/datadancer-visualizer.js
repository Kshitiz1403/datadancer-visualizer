import { jsx as e, jsxs as t, Fragment as O } from "react/jsx-runtime";
import k, { useContext as Q, useState as Y, useMemo as I } from "react";
import { Handle as j, Position as P, useNodesState as ee, useEdgesState as te, ReactFlow as ne, Controls as ie, MiniMap as ae, Background as re } from "@xyflow/react";
import { createPortal as se } from "react-dom";
import { Check as oe, Copy as ce, X as B, Zap as U, ZapOff as A, AlertCircle as R, Database as G, GitBranch as D, Activity as z, Clock as Z, ChevronRight as de, ShieldAlert as F, Shield as le, Eye as $ } from "lucide-react";
const C = {
  unexecuted: "#9ca3af",
  error: "#ef4444",
  operation: "#10b981",
  switch: "#f59e0b",
  default: "#6366f1"
}, ue = (a, h) => !a || !h ? !1 : a.toLowerCase().includes(h.toLowerCase()), me = (a) => {
  if (!a.hasError || !a.definition.onErrors || !a.execution)
    return null;
  const h = a.execution.error || a.execution.actions?.find((s) => s.error)?.error;
  if (!h) return null;
  for (const s of a.definition.onErrors)
    if (s.errorRef !== "DefaultErrorRef" && ue(h, s.errorRef)) {
      const d = typeof s.transition == "string" ? s.transition : s.transition.nextState;
      return { errorHandler: s, nextState: d };
    }
  const m = a.definition.onErrors.find((s) => s.errorRef === "DefaultErrorRef");
  if (m) {
    const s = typeof m.transition == "string" ? m.transition : m.transition.nextState;
    return { errorHandler: m, nextState: s };
  }
  return null;
}, M = (a) => typeof a.transition == "string" ? a.transition : a.transition.nextState, L = (a) => !a.transition || a.end ? null : typeof a.transition == "string" ? a.transition : a.transition.nextState ? a.transition.nextState : null, J = (a) => {
  const h = [], m = [];
  return a.states.forEach((s, d) => {
    const u = new Date(s.startTime).getTime(), f = new Date(s.endTime).getTime() - u, c = !!(s.error || s.actions?.some((v) => v.error)), o = {
      label: s.name,
      state: {
        name: s.name,
        type: s.type,
        definition: s,
        wasExecuted: !0,
        hasError: c,
        duration: f,
        execution: s
      },
      duration: f,
      hasError: c,
      wasExecuted: !0
    }, n = Math.floor(d / 3), b = d % 3 * 380, x = n * 220 + (s.type === "switch" ? 50 : 0);
    if (h.push({
      id: `state-${d}`,
      type: "workflowNode",
      position: { x: b, y: x },
      data: o,
      draggable: !0
    }), d < a.states.length - 1) {
      const v = !!(s.error || s.actions?.some((S) => S.error));
      let y = C.operation;
      v ? y = C.error : s.type === "switch" && (y = C.switch), m.push({
        id: `edge-${d}`,
        source: `state-${d}`,
        target: `state-${d + 1}`,
        type: "default",
        animated: !v,
        style: {
          stroke: y,
          strokeWidth: 2,
          strokeDasharray: v ? "5,5" : void 0
        }
      });
    }
  }), { nodes: h, edges: m };
}, V = (a) => {
  const h = [], m = [], s = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  a.states.forEach((i) => {
    d.set(i.name, i);
  });
  const u = (i, f, c, o) => {
    if (f.has(i) || !d.has(i)) return;
    f.add(i);
    const n = d.get(i);
    s.set(i, { x: c * 400, y: o * 250 });
    let l = 0;
    if (n.definition.type === "switch")
      n.definition.dataConditions && n.definition.dataConditions.forEach((b) => {
        u(b.transition.nextState, f, c + 1, o + l), l++;
      }), n.definition.defaultCondition && (u(n.definition.defaultCondition.transition.nextState, f, c + 1, o + l), l++);
    else {
      const b = L(n.definition);
      b && (u(b, f, c + 1, o + l), l++), n.definition.onErrors && n.definition.onErrors.forEach((x, v) => {
        const y = M(x);
        u(y, f, c + 1, o + l + v);
      });
    }
  };
  return u(a.startState, /* @__PURE__ */ new Set(), 0, 0), a.states.forEach((i, f) => {
    const c = i.duration || 0, o = {
      label: i.name,
      state: i,
      duration: c,
      hasError: i.hasError,
      wasExecuted: i.wasExecuted
    }, n = s.get(i.name) || { x: f * 400, y: 0 };
    h.push({
      id: `state-${i.name}`,
      type: "workflowNode",
      position: n,
      data: o,
      draggable: !0,
      className: i.wasExecuted ? "executed-node" : "unexecuted-node"
    });
  }), a.states.forEach((i) => {
    const f = `state-${i.name}`;
    if (i.definition.type === "switch") {
      if (i.definition.dataConditions && i.definition.dataConditions.forEach((c) => {
        const o = `state-${c.transition.nextState}`, n = i.wasExecuted && i.execution?.matchedCondition === c.name;
        m.push({
          id: `edge-${i.name}-${c.name}`,
          source: f,
          target: o,
          type: "default",
          label: c.name,
          animated: n,
          style: {
            stroke: n ? C.switch : "#d1d5db",
            strokeWidth: n ? 2 : 1,
            strokeDasharray: n ? void 0 : "5,5"
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: n ? 600 : 400,
            fill: n ? C.switch : "#6b7280"
          }
        });
      }), i.definition.defaultCondition) {
        const c = `state-${i.definition.defaultCondition.transition.nextState}`, o = i.wasExecuted && i.execution?.matchedCondition === "default";
        m.push({
          id: `edge-${i.name}-default`,
          source: f,
          target: c,
          type: "default",
          label: "default",
          animated: o,
          style: {
            stroke: o ? C.switch : "#d1d5db",
            strokeWidth: o ? 2 : 1,
            strokeDasharray: o ? void 0 : "5,5"
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: o ? 600 : 400,
            fill: o ? C.switch : "#6b7280"
          }
        });
      }
    } else {
      const c = me(i), o = L(i.definition);
      if (o) {
        const n = `state-${o}`, l = i.wasExecuted && !i.hasError;
        let b = C.operation;
        (i.hasError || !i.wasExecuted) && (b = "#d1d5db"), m.push({
          id: `edge-${i.name}-${o}`,
          source: f,
          target: n,
          type: "default",
          animated: l,
          style: {
            stroke: b,
            strokeWidth: l ? 2 : 1,
            strokeDasharray: l ? void 0 : "5,5"
          }
        });
      }
      c ? (m.push({
        id: `edge-${i.name}-error-${c.errorHandler.errorRef}`,
        source: f,
        target: `state-${c.nextState}`,
        type: "default",
        label: `error: ${c.errorHandler.errorRef}`,
        animated: !0,
        style: { stroke: C.error, strokeWidth: 2, strokeDasharray: "3,3" },
        labelStyle: { fontSize: 10, fontWeight: 600, fill: C.error }
      }), i.definition.onErrors && i.definition.onErrors.forEach((n) => {
        n.errorRef !== c.errorHandler.errorRef && m.push({
          id: `edge-${i.name}-error-unexecuted-${n.errorRef}`,
          source: f,
          target: `state-${M(n)}`,
          type: "default",
          label: `error: ${n.errorRef}`,
          animated: !1,
          style: { stroke: "#d1d5db", strokeWidth: 1, strokeDasharray: "5,5" },
          labelStyle: { fontSize: 10, fontWeight: 400, fill: "#6b7280" }
        });
      })) : i.definition.onErrors && i.definition.onErrors.forEach((n) => {
        m.push({
          id: `edge-${i.name}-error-unexecuted-${n.errorRef}`,
          source: f,
          target: `state-${M(n)}`,
          type: "default",
          label: `error: ${n.errorRef}`,
          animated: !1,
          style: { stroke: "#d1d5db", strokeWidth: 1, strokeDasharray: "5,5" },
          labelStyle: { fontSize: 10, fontWeight: 400, fill: "#6b7280" }
        });
      });
    }
  }), { nodes: h, edges: m };
}, be = (a, h) => {
  const m = /* @__PURE__ */ new Map();
  h && h.states.forEach((d) => {
    m.set(d.name, d);
  });
  const s = a.states.map((d) => {
    const u = m.get(d.name), i = !!u, f = i ? !!(u.error || u.actions?.some((o) => o.error)) : !1;
    let c = 0;
    return i && u.startTime && u.endTime && (c = new Date(u.endTime).getTime() - new Date(u.startTime).getTime()), {
      name: d.name,
      type: d.type,
      definition: d,
      execution: u,
      wasExecuted: i,
      hasError: f,
      duration: c
    };
  });
  return { definition: a, execution: h, states: s, startState: a.start };
}, W = (a) => a < 1e3 ? `${a}ms` : `${(a / 1e3).toFixed(2)}s`, _ = (a, h, m = !0, s) => {
  const d = s?.colors ?? C;
  if (h) return d.error;
  if (!m) return d.unexecuted;
  switch (a) {
    case "operation":
      return d.operation;
    case "switch":
      return d.switch;
    default:
      return d.default;
  }
}, X = ({ isOpen: a, onClose: h, title: m, data: s, subtitle: d }) => {
  const [u, i] = k.useState(!1);
  if (k.useEffect(() => {
    const n = (l) => {
      l.key === "Escape" && h();
    };
    return a && (document.addEventListener("keydown", n), document.body.style.overflow = "hidden"), () => {
      document.removeEventListener("keydown", n), document.body.style.overflow = "unset";
    };
  }, [a, h]), !a) return null;
  const f = JSON.stringify(s, null, 2);
  return se(
    /* @__PURE__ */ e("div", { className: "json-modal-backdrop", onClick: (n) => {
      n.target === n.currentTarget && h();
    }, children: /* @__PURE__ */ t("div", { className: "json-modal", children: [
      /* @__PURE__ */ t("div", { className: "json-modal-header", children: [
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("h2", { children: m }),
          d && /* @__PURE__ */ e("p", { className: "json-modal-subtitle", children: d })
        ] }),
        /* @__PURE__ */ t("div", { className: "json-modal-actions", children: [
          /* @__PURE__ */ t(
            "button",
            {
              className: "json-modal-copy-btn",
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(f), i(!0), setTimeout(() => i(!1), 2e3);
                } catch (n) {
                  console.error("Failed to copy:", n);
                }
              },
              title: "Copy JSON",
              children: [
                u ? /* @__PURE__ */ e(oe, { size: 18 }) : /* @__PURE__ */ e(ce, { size: 18 }),
                u ? "Copied!" : "Copy"
              ]
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              className: "json-modal-close-btn",
              onClick: h,
              title: "Close",
              children: /* @__PURE__ */ e(B, { size: 20 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "json-modal-content", children: /* @__PURE__ */ e("pre", { className: "json-display", children: f }) })
    ] }) }),
    document.body
  );
}, he = ({ data: a, onNodeClick: h, isSelected: m, id: s }) => {
  const d = Q(K), [u, i] = Y({
    isOpen: !1,
    title: "",
    data: null,
    subtitle: ""
  }), { label: f, state: c, duration: o, hasError: n, wasExecuted: l } = a, b = _(c.type, n, l, d), x = () => {
    const p = { size: 16, style: { color: b } };
    switch (c.type) {
      case "operation":
        return /* @__PURE__ */ e(z, { ...p });
      case "switch":
        return /* @__PURE__ */ e(D, { ...p });
      default:
        return /* @__PURE__ */ e(G, { ...p });
    }
  }, v = () => {
    i({ isOpen: !1, title: "", data: null, subtitle: "" });
  }, y = n ? "error" : c.type, S = m ? "selected" : "", N = c.execution, r = c.definition, g = (p) => {
    p.target.closest("button") || h?.(a, s || "");
  }, w = () => N ? /* @__PURE__ */ t(O, { children: [
    /* @__PURE__ */ t("div", { className: "node-meta", children: [
      /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(Z, { size: 14 }),
        /* @__PURE__ */ e("span", { children: W(o) })
      ] }),
      N.actions && N.actions.length > 0 && /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(z, { size: 14 }),
        /* @__PURE__ */ t("span", { children: [
          N.actions.length,
          " action",
          N.actions.length !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "node-summary", children: [
      c.type === "switch" && N.matchedCondition && /* @__PURE__ */ t("div", { className: "summary-item condition-item", children: [
        /* @__PURE__ */ e(D, { size: 12 }),
        /* @__PURE__ */ t("span", { children: [
          "Matched: ",
          N.matchedCondition
        ] })
      ] }),
      N.actions && N.actions.length > 0 && /* @__PURE__ */ e("div", { className: "summary-item actions-preview", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        N.actions.slice(0, 2).map((p, E) => /* @__PURE__ */ t("div", { className: "action-preview", children: [
          /* @__PURE__ */ e("span", { className: "action-preview-name", children: p.activityName }),
          /* @__PURE__ */ e("span", { className: "action-preview-duration", children: W(new Date(p.endTime).getTime() - new Date(p.startTime).getTime()) }),
          p.error && /* @__PURE__ */ e(R, { size: 10, className: "action-preview-error" })
        ] }, E)),
        N.actions.length > 2 && /* @__PURE__ */ t("div", { className: "action-preview more-actions", children: [
          "+",
          N.actions.length - 2,
          " more"
        ] })
      ] }) }),
      /* @__PURE__ */ e("div", { className: "summary-item data-preview", children: /* @__PURE__ */ t("div", { className: "data-preview-grid", children: [
        /* @__PURE__ */ t("div", { className: "data-preview-item", children: [
          /* @__PURE__ */ e("span", { className: "data-label", children: "Input" }),
          /* @__PURE__ */ e("span", { className: "data-preview-text", children: typeof N.input == "object" ? `${Object.keys(N.input || {}).length} fields` : String(N.input).substring(0, 20) + "..." })
        ] }),
        /* @__PURE__ */ t("div", { className: "data-preview-item", children: [
          /* @__PURE__ */ e("span", { className: "data-label", children: "Output" }),
          /* @__PURE__ */ e("span", { className: "data-preview-text", children: typeof N.output == "object" ? `${Object.keys(N.output || {}).length} fields` : String(N.output).substring(0, 20) + "..." })
        ] })
      ] }) })
    ] })
  ] }) : null, T = () => /* @__PURE__ */ t(O, { children: [
    /* @__PURE__ */ t("div", { className: "node-meta", children: [
      /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(A, { size: 14 }),
        /* @__PURE__ */ e("span", { children: "Not executed" })
      ] }),
      r.actions && r.actions.length > 0 && /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(z, { size: 14 }),
        /* @__PURE__ */ t("span", { children: [
          r.actions.length,
          " planned action",
          r.actions.length !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "node-summary", children: [
      c.type === "switch" && r.dataConditions && /* @__PURE__ */ e("div", { className: "summary-item", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        r.dataConditions.map((p, E) => /* @__PURE__ */ t("div", { className: "condition-item unexecuted", children: [
          /* @__PURE__ */ e(D, { size: 12 }),
          /* @__PURE__ */ t("span", { children: [
            p.name,
            ": ",
            p.condition
          ] })
        ] }, E)),
        r.defaultCondition && /* @__PURE__ */ t("div", { className: "condition-item unexecuted", children: [
          /* @__PURE__ */ e(D, { size: 12 }),
          /* @__PURE__ */ e("span", { children: "default: fallback" })
        ] })
      ] }) }),
      r.actions && r.actions.length > 0 && /* @__PURE__ */ e("div", { className: "summary-item actions-preview", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        r.actions.slice(0, 2).map((p, E) => /* @__PURE__ */ t("div", { className: "action-preview unexecuted", children: [
          /* @__PURE__ */ e("span", { className: "action-preview-name", children: p.functionRef.refName }),
          /* @__PURE__ */ e("span", { className: "action-preview-duration", children: "planned" })
        ] }, E)),
        r.actions.length > 2 && /* @__PURE__ */ t("div", { className: "action-preview more-actions", children: [
          "+",
          r.actions.length - 2,
          " more planned"
        ] })
      ] }) })
    ] })
  ] });
  return /* @__PURE__ */ t("div", { className: `workflow-node ${y} ${S}`, onClick: g, children: [
    /* @__PURE__ */ e(j, { type: "target", position: P.Left }),
    /* @__PURE__ */ e("div", { className: "node-header", children: /* @__PURE__ */ t("div", { className: "node-title", children: [
      l ? /* @__PURE__ */ e(U, { size: 16, className: "success-icon" }) : /* @__PURE__ */ e(A, { size: 16, className: "unexecuted-icon" }),
      x(),
      /* @__PURE__ */ e("span", { children: f }),
      n && /* @__PURE__ */ e(R, { size: 16, className: "error-icon" })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "node-content", children: l ? w() : T() }),
    /* @__PURE__ */ e(j, { type: "source", position: P.Right }),
    /* @__PURE__ */ e(
      X,
      {
        isOpen: u.isOpen,
        onClose: v,
        title: u.title,
        data: u.data,
        subtitle: u.subtitle
      }
    )
  ] });
}, q = {
  colors: {
    executed: "#10b981",
    unexecuted: "#9ca3af",
    error: "#ef4444",
    operation: "#10b981",
    switch: "#f59e0b",
    default: "#6366f1"
  }
}, K = k.createContext(q), H = (a) => "definition" in a && "startState" in a, fe = ({
  data: a,
  onNodeClick: h,
  selectedNodeId: m = null,
  theme: s,
  fitView: d = !0,
  minZoom: u = 0.3,
  maxZoom: i = 2,
  className: f,
  style: c
}) => {
  const o = I(() => ({
    colors: { ...q.colors, ...s?.colors }
  }), [s]), n = k.useCallback((p) => {
    const E = m === p.id;
    return /* @__PURE__ */ e(he, { ...p, onNodeClick: h, isSelected: E });
  }, [h, m]), l = k.useMemo(() => ({
    workflowNode: n
  }), [n]), { nodes: b, edges: x } = I(() => H(a) ? V(a) : J(a), [a]), [v, y, S] = ee(b), [N, r, g] = te(x), [w, T] = k.useState(null);
  return k.useEffect(() => {
    const { nodes: p, edges: E } = H(a) ? V(a) : J(a);
    y(p), r(E), w && setTimeout(() => w.fitView(), 100);
  }, [a, y, r, w]), /* @__PURE__ */ e(K.Provider, { value: o, children: /* @__PURE__ */ e(
    "div",
    {
      className: f,
      style: { width: "100%", height: "100%", minHeight: "400px", ...c },
      children: /* @__PURE__ */ t(
        ne,
        {
          nodes: v,
          edges: N,
          onNodesChange: S,
          onEdgesChange: g,
          nodeTypes: l,
          fitView: d,
          fitViewOptions: { padding: 100, minZoom: u, maxZoom: i },
          defaultViewport: { x: 0, y: 0, zoom: 0.8 },
          attributionPosition: "bottom-left",
          proOptions: { hideAttribution: !0 },
          onInit: (p) => {
            T(p), setTimeout(() => p.fitView(), 100);
          },
          panOnScroll: !0,
          zoomOnScroll: !0,
          zoomOnPinch: !0,
          panOnScrollSpeed: 0.85,
          children: [
            /* @__PURE__ */ e(ie, { position: "bottom-left" }),
            /* @__PURE__ */ e(
              ae,
              {
                position: "bottom-right",
                nodeColor: (p) => {
                  const E = p.data;
                  return _(
                    E?.state?.type ?? "",
                    E?.hasError ?? !1,
                    E?.wasExecuted ?? !0,
                    o
                  );
                }
              }
            ),
            /* @__PURE__ */ e(re, { variant: "dots", gap: 16, size: 1, color: "#d1d5db" })
          ]
        },
        `workflow-${v.length}-${N.length}`
      )
    }
  ) });
}, pe = ({ isOpen: a, nodeData: h, onClose: m }) => {
  const [s, d] = k.useState({
    isOpen: !1,
    title: "",
    data: null,
    subtitle: ""
  });
  if (!a || !h) return null;
  const { label: u, state: i, duration: f, hasError: c, wasExecuted: o } = h, n = i.execution, l = i.definition, b = (r, g) => !r || !g ? !1 : r.toLowerCase().includes(g.toLowerCase()), v = (() => {
    if (!c || !l.onErrors || !n) return null;
    const r = n.error || n.actions?.find((w) => w.error)?.error;
    if (!r) return null;
    const g = l.onErrors.find(
      (w) => w.errorRef !== "DefaultErrorRef" && b(r, w.errorRef)
    );
    return g || l.onErrors.find((w) => w.errorRef === "DefaultErrorRef");
  })(), y = (r, g, w) => {
    d({ isOpen: !0, title: r, data: g, subtitle: w });
  }, S = () => {
    d({ isOpen: !1, title: "", data: null, subtitle: "" });
  };
  return /* @__PURE__ */ e(O, { children: a && /* @__PURE__ */ t(O, { children: [
    /* @__PURE__ */ e("div", { className: "panel-overlay", onClick: m }),
    /* @__PURE__ */ t("div", { className: "node-detail-panel open", children: [
      /* @__PURE__ */ t("div", { className: "panel-header", children: [
        /* @__PURE__ */ t("div", { className: "panel-title", children: [
          /* @__PURE__ */ t("div", { className: "title-main", children: [
            o ? /* @__PURE__ */ e(U, { size: 18, className: "success-icon" }) : /* @__PURE__ */ e(A, { size: 18, className: "unexecuted-icon" }),
            (() => {
              const r = { size: 20 };
              switch (i.type) {
                case "operation":
                  return /* @__PURE__ */ e(z, { ...r });
                case "switch":
                  return /* @__PURE__ */ e(D, { ...r });
                default:
                  return /* @__PURE__ */ e(G, { ...r });
              }
            })(),
            /* @__PURE__ */ e("span", { className: "node-name", children: u }),
            c && /* @__PURE__ */ e(R, { size: 18, className: "error-icon" })
          ] }),
          /* @__PURE__ */ t("div", { className: "title-meta", children: [
            /* @__PURE__ */ e("span", { className: `node-status ${o ? "executed" : "unexecuted"}`, children: o ? "Executed" : "Not Executed" }),
            /* @__PURE__ */ e("span", { className: "node-type-badge", children: i.type })
          ] })
        ] }),
        /* @__PURE__ */ e("button", { className: "panel-close", onClick: m, children: /* @__PURE__ */ e(B, { size: 20 }) })
      ] }),
      /* @__PURE__ */ t("div", { className: "panel-content", children: [
        /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Execution Summary" }),
          /* @__PURE__ */ t("div", { className: "summary-grid", children: [
            /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(Z, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Duration" }),
              /* @__PURE__ */ e("span", { className: "value", children: o ? W(f) : "N/A" })
            ] }),
            n?.actions && /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(z, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Actions" }),
              /* @__PURE__ */ e("span", { className: "value", children: n.actions.length })
            ] }),
            !o && l.actions && /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(z, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Planned Actions" }),
              /* @__PURE__ */ e("span", { className: "value", children: l.actions.length })
            ] })
          ] })
        ] }),
        i.type === "switch" && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Switch Conditions" }),
          o && n?.matchedCondition ? /* @__PURE__ */ e("div", { className: "condition-result", children: /* @__PURE__ */ t("div", { className: "matched-condition", children: [
            /* @__PURE__ */ e(de, { size: 16, className: "success-icon" }),
            /* @__PURE__ */ t("span", { children: [
              "Matched: ",
              /* @__PURE__ */ e("strong", { children: n.matchedCondition })
            ] })
          ] }) }) : null,
          l.dataConditions && /* @__PURE__ */ t("div", { className: "conditions-list", children: [
            l.dataConditions.map((r, g) => /* @__PURE__ */ t(
              "div",
              {
                className: `condition-item ${o && n?.matchedCondition === r.name ? "matched" : "unmatched"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "condition-header", children: [
                    /* @__PURE__ */ e("span", { className: "condition-name", children: r.name }),
                    o && n?.matchedCondition === r.name && /* @__PURE__ */ e("span", { className: "condition-badge", children: "Matched" })
                  ] }),
                  /* @__PURE__ */ e("div", { className: "condition-expression", children: r.condition }),
                  /* @__PURE__ */ t("div", { className: "condition-target", children: [
                    "→ ",
                    r.transition.nextState
                  ] })
                ]
              },
              g
            )),
            l.defaultCondition && /* @__PURE__ */ t(
              "div",
              {
                className: `condition-item ${o && n?.matchedCondition === "default" ? "matched" : "unmatched"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "condition-header", children: [
                    /* @__PURE__ */ e("span", { className: "condition-name", children: "default" }),
                    o && n?.matchedCondition === "default" && /* @__PURE__ */ e("span", { className: "condition-badge", children: "Matched" })
                  ] }),
                  /* @__PURE__ */ e("div", { className: "condition-expression", children: "fallback condition" }),
                  /* @__PURE__ */ t("div", { className: "condition-target", children: [
                    "→ ",
                    l.defaultCondition.transition.nextState
                  ] })
                ]
              }
            )
          ] })
        ] }),
        l.onErrors && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Error Handlers" }),
          c && v && /* @__PURE__ */ e("div", { className: "error-handler-result", children: /* @__PURE__ */ t("div", { className: "triggered-handler", children: [
            /* @__PURE__ */ e(F, { size: 16, className: "error-icon" }),
            /* @__PURE__ */ t("span", { children: [
              "Triggered: ",
              /* @__PURE__ */ e("strong", { children: v.errorRef })
            ] })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "error-handlers-list", children: l.onErrors.map((r, g) => {
            const w = c && v?.errorRef === r.errorRef, T = typeof r.transition == "string" ? r.transition : r.transition.nextState;
            return /* @__PURE__ */ t(
              "div",
              {
                className: `error-handler-item ${w ? "triggered" : "not-triggered"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "error-handler-header", children: [
                    /* @__PURE__ */ t("div", { className: "error-handler-name", children: [
                      w ? /* @__PURE__ */ e(F, { size: 16, className: "error-icon" }) : /* @__PURE__ */ e(le, { size: 16, className: "shield-icon" }),
                      /* @__PURE__ */ e("span", { children: r.errorRef })
                    ] }),
                    w && /* @__PURE__ */ e("span", { className: "error-handler-badge", children: "Triggered" })
                  ] }),
                  /* @__PURE__ */ t("div", { className: "error-handler-target", children: [
                    "→ ",
                    T
                  ] })
                ]
              },
              g
            );
          }) })
        ] }),
        (o && n?.actions || !o && l.actions) && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: o ? "Executed Actions" : "Planned Actions" }),
          /* @__PURE__ */ e("div", { className: "actions-detail", children: o && n?.actions ? n.actions.map((r, g) => /* @__PURE__ */ t("div", { className: "action-detail-item", children: [
            /* @__PURE__ */ t("div", { className: "action-header", children: [
              /* @__PURE__ */ e("span", { className: "action-name", children: r.activityName }),
              /* @__PURE__ */ t("div", { className: "action-meta", children: [
                /* @__PURE__ */ e("span", { className: "action-duration", children: W(new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) }),
                r.error && /* @__PURE__ */ e(R, { size: 14, className: "error-icon" })
              ] })
            ] }),
            /* @__PURE__ */ t("div", { className: "action-buttons", children: [
              /* @__PURE__ */ t(
                "button",
                {
                  className: "detail-button",
                  onClick: () => y(
                    `${u} > ${r.activityName} - Arguments`,
                    r.arguments,
                    "Action input arguments"
                  ),
                  children: [
                    /* @__PURE__ */ e($, { size: 14 }),
                    "Arguments"
                  ]
                }
              ),
              /* @__PURE__ */ t(
                "button",
                {
                  className: `detail-button ${r.error ? "error" : ""}`,
                  onClick: () => y(
                    `${u} > ${r.activityName} - ${r.error ? "Error" : "Output"}`,
                    r.output || r.error,
                    r.error ? "Action error details" : "Action output data"
                  ),
                  children: [
                    /* @__PURE__ */ e($, { size: 14 }),
                    r.error ? "Error" : "Output"
                  ]
                }
              )
            ] })
          ] }, g)) : l.actions?.map((r, g) => /* @__PURE__ */ t("div", { className: "action-detail-item planned", children: [
            /* @__PURE__ */ t("div", { className: "action-header", children: [
              /* @__PURE__ */ e("span", { className: "action-name", children: r.functionRef.refName }),
              /* @__PURE__ */ e("div", { className: "action-meta", children: /* @__PURE__ */ e("span", { className: "action-duration", children: "planned" }) })
            ] }),
            /* @__PURE__ */ e("div", { className: "action-buttons", children: /* @__PURE__ */ t(
              "button",
              {
                className: "detail-button",
                onClick: () => y(
                  `${u} > ${r.functionRef.refName} - Arguments`,
                  r.functionRef.arguments,
                  "Planned action arguments"
                ),
                children: [
                  /* @__PURE__ */ e($, { size: 14 }),
                  "Arguments"
                ]
              }
            ) })
          ] }, g)) })
        ] }),
        /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Data" }),
          /* @__PURE__ */ e("div", { className: "data-detail", children: o && n ? /* @__PURE__ */ t(O, { children: [
            /* @__PURE__ */ t("div", { className: "data-item", children: [
              /* @__PURE__ */ t("div", { className: "data-header", children: [
                /* @__PURE__ */ e("span", { children: "Input Data" }),
                /* @__PURE__ */ t(
                  "button",
                  {
                    className: "detail-button small",
                    onClick: () => y(`${u} - Input`, n.input, "State input data"),
                    children: [
                      /* @__PURE__ */ e($, { size: 12 }),
                      "View Full"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ t("pre", { className: "data-preview", children: [
                JSON.stringify(n.input, null, 2).substring(0, 200),
                "..."
              ] })
            ] }),
            /* @__PURE__ */ t("div", { className: "data-item", children: [
              /* @__PURE__ */ t("div", { className: "data-header", children: [
                /* @__PURE__ */ e("span", { children: "Output Data" }),
                /* @__PURE__ */ t(
                  "button",
                  {
                    className: "detail-button small",
                    onClick: () => y(`${u} - Output`, n.output, "State output data"),
                    children: [
                      /* @__PURE__ */ e($, { size: 12 }),
                      "View Full"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ t("pre", { className: "data-preview", children: [
                JSON.stringify(n.output, null, 2).substring(0, 200),
                "..."
              ] })
            ] })
          ] }) : /* @__PURE__ */ t("div", { className: "data-item", children: [
            /* @__PURE__ */ t("div", { className: "data-header", children: [
              /* @__PURE__ */ e("span", { children: "Definition" }),
              /* @__PURE__ */ t(
                "button",
                {
                  className: "detail-button small",
                  onClick: () => y(`${u} - Definition`, l, "State definition"),
                  children: [
                    /* @__PURE__ */ e($, { size: 12 }),
                    "View Full"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ t("pre", { className: "data-preview", children: [
              JSON.stringify(l, null, 2).substring(0, 200),
              "..."
            ] })
          ] }) })
        ] }),
        c && o && n && /* @__PURE__ */ t("div", { className: "detail-section error-section", children: [
          /* @__PURE__ */ e("h3", { children: "Error Details" }),
          /* @__PURE__ */ t("div", { className: "error-details", children: [
            n.error && /* @__PURE__ */ e("div", { className: "error-message", children: n.error }),
            n.actions?.map(
              (r, g) => r.error && /* @__PURE__ */ t("div", { className: "error-message", children: [
                /* @__PURE__ */ t("strong", { children: [
                  r.activityName,
                  ":"
                ] }),
                " ",
                r.error
              ] }, g)
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(
      X,
      {
        isOpen: s.isOpen,
        onClose: S,
        title: s.title,
        data: s.data,
        subtitle: s.subtitle
      }
    )
  ] }) });
}, Ee = ({
  data: a,
  onNodeClick: h,
  showDetailPanel: m = !0,
  renderDetailPanel: s,
  theme: d,
  fitView: u = !0,
  minZoom: i = 0.3,
  maxZoom: f = 2,
  className: c,
  style: o
}) => {
  const [n, l] = k.useState({
    isOpen: !1,
    nodeData: null,
    selectedNodeId: null
  }), b = k.useCallback((v, y) => {
    h?.(v), (m || s) && l({ isOpen: !0, nodeData: v, selectedNodeId: y });
  }, [h, m, s]), x = k.useCallback(() => {
    l({ isOpen: !1, nodeData: null, selectedNodeId: null });
  }, []);
  return /* @__PURE__ */ t("div", { style: { width: "100%", height: "100%", minHeight: "400px", ...o }, className: c, children: [
    /* @__PURE__ */ e(
      fe,
      {
        data: a,
        onNodeClick: b,
        selectedNodeId: n.selectedNodeId,
        theme: d,
        fitView: u,
        minZoom: i,
        maxZoom: f
      }
    ),
    s && n.isOpen && n.nodeData ? s(n.nodeData, x) : m && /* @__PURE__ */ e(
      pe,
      {
        isOpen: n.isOpen,
        nodeData: n.nodeData,
        onClose: x
      }
    )
  ] });
};
export {
  X as JsonModal,
  pe as NodeDetailPanel,
  fe as WorkflowGraph,
  he as WorkflowNode,
  Ee as WorkflowVisualizer,
  be as combineWorkflowData,
  W as formatDuration,
  _ as getNodeTypeColor,
  V as parseCombinedWorkflowData,
  J as parseWorkflowData
};
//# sourceMappingURL=datadancer-visualizer.js.map
