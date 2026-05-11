import { jsx as e, jsxs as t, Fragment as D } from "react/jsx-runtime";
import $, { useContext as ae, useState as se, useMemo as _ } from "react";
import { Handle as j, Position as H, useNodesState as re, useEdgesState as oe, ReactFlow as ce, Controls as de, MiniMap as le, Background as ue } from "@xyflow/react";
import { createPortal as me } from "react-dom";
import { Check as he, Copy as fe, X, Zap as q, ZapOff as L, AlertCircle as P, Database as Q, GitBranch as I, Activity as A, Clock as Y, ChevronRight as pe, ShieldAlert as J, Shield as Ne, Eye as R } from "lucide-react";
const T = {
  unexecuted: "#9ca3af",
  error: "#ef4444",
  operation: "#10b981",
  switch: "#f59e0b",
  default: "#6366f1"
}, ge = (a, l) => !a || !l ? !1 : a.toLowerCase().includes(l.toLowerCase()), ve = (a) => {
  if (!a.hasError || !a.definition.onErrors || !a.execution)
    return null;
  const l = a.execution.error || a.execution.actions?.find((h) => h.error)?.error;
  if (!l) return null;
  for (const h of a.definition.onErrors)
    if (h.errorRef !== "DefaultErrorRef" && ge(l, h.errorRef)) {
      const d = typeof h.transition == "string" ? h.transition : h.transition.nextState;
      return { errorHandler: h, nextState: d };
    }
  const p = a.definition.onErrors.find((h) => h.errorRef === "DefaultErrorRef");
  if (p) {
    const h = typeof p.transition == "string" ? p.transition : p.transition.nextState;
    return { errorHandler: p, nextState: h };
  }
  return null;
}, F = (a) => typeof a.transition == "string" ? a.transition : a.transition.nextState, V = (a) => !a.transition || a.end ? null : typeof a.transition == "string" ? a.transition : a.transition.nextState ? a.transition.nextState : null, B = (a) => {
  const l = [], p = [], h = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  a.states.forEach((n) => {
    d.set(n.name, n);
  });
  const m = (n, f, c, u) => {
    if (f.has(n) || !d.has(n)) return;
    f.add(n);
    const r = d.get(n);
    h.set(n, { x: c * 400, y: u * 250 });
    let s = 0;
    if (r.definition.type === "switch") {
      if (r.definition.dataConditions && r.definition.dataConditions.forEach((o) => {
        const C = typeof o.transition == "string" ? o.transition : o.transition.nextState;
        m(C, f, c + 1, u + s), s++;
      }), r.definition.defaultCondition) {
        const o = typeof r.definition.defaultCondition.transition == "string" ? r.definition.defaultCondition.transition : r.definition.defaultCondition.transition.nextState;
        m(o, f, c + 1, u + s), s++;
      }
    } else {
      const o = V(r.definition);
      o && (m(o, f, c + 1, u + s), s++), r.definition.onErrors && r.definition.onErrors.forEach((C, E) => {
        const x = F(C);
        m(x, f, c + 1, u + s + E);
      });
    }
  };
  return m(a.startState, /* @__PURE__ */ new Set(), 0, 0), a.states.forEach((n, f) => {
    const c = n.duration || 0, u = {
      label: n.name,
      state: n,
      duration: c,
      hasError: n.hasError,
      wasExecuted: n.wasExecuted
    }, r = h.get(n.name) || { x: f * 400, y: 0 };
    l.push({
      id: `state-${n.name}`,
      type: "workflowNode",
      position: r,
      data: u,
      className: n.wasExecuted ? "executed-node" : "unexecuted-node"
    });
  }), a.states.forEach((n) => {
    const f = `state-${n.name}`;
    if (n.definition.type === "switch") {
      if (n.definition.dataConditions && n.definition.dataConditions.forEach((c, u) => {
        const s = `state-${typeof c.transition == "string" ? c.transition : c.transition.nextState}`, o = c.name ?? c.condition, C = n.execution?.matchedCondition, E = n.wasExecuted && !!(C && (C === c.name || C === c.condition));
        p.push({
          id: `edge-${n.name}-${o}`,
          source: f,
          sourceHandle: `condition-${u}`,
          target: s,
          type: "default",
          label: o,
          animated: E,
          style: {
            stroke: E ? T.switch : "#d1d5db",
            strokeWidth: E ? 3 : 2,
            strokeDasharray: E ? void 0 : "5,5"
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: E ? 600 : 400,
            fill: E ? T.switch : "#6b7280"
          }
        });
      }), n.definition.defaultCondition) {
        const c = `state-${typeof n.definition.defaultCondition.transition == "string" ? n.definition.defaultCondition.transition : n.definition.defaultCondition.transition.nextState}`, u = n.wasExecuted && n.execution?.matchedCondition === "default";
        p.push({
          id: `edge-${n.name}-default`,
          source: f,
          sourceHandle: "condition-default",
          target: c,
          type: "default",
          label: "default",
          animated: u,
          style: {
            stroke: u ? T.switch : "#d1d5db",
            strokeWidth: u ? 3 : 2,
            strokeDasharray: u ? void 0 : "5,5"
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: u ? 600 : 400,
            fill: u ? T.switch : "#6b7280"
          }
        });
      }
    } else {
      const c = ve(n), u = V(n.definition);
      if (u) {
        const r = `state-${u}`, s = n.wasExecuted && !n.hasError;
        let o = T.operation;
        (n.hasError || !n.wasExecuted) && (o = "#d1d5db"), p.push({
          id: `edge-${n.name}-${u}`,
          source: f,
          target: r,
          type: "default",
          animated: s,
          style: {
            stroke: o,
            strokeWidth: s ? 3 : 2,
            strokeDasharray: s ? void 0 : "5,5"
          }
        });
      }
      c ? (p.push({
        id: `edge-${n.name}-error-${c.errorHandler.errorRef}`,
        source: f,
        target: `state-${c.nextState}`,
        type: "default",
        label: `error: ${c.errorHandler.errorRef}`,
        animated: !0,
        style: { stroke: T.error, strokeWidth: 3, strokeDasharray: "3,3" },
        labelStyle: { fontSize: 10, fontWeight: 600, fill: T.error }
      }), n.definition.onErrors && n.definition.onErrors.forEach((r) => {
        r.errorRef !== c.errorHandler.errorRef && p.push({
          id: `edge-${n.name}-error-unexecuted-${r.errorRef}`,
          source: f,
          target: `state-${F(r)}`,
          type: "default",
          label: `error: ${r.errorRef}`,
          animated: !1,
          style: { stroke: "#d1d5db", strokeWidth: 2, strokeDasharray: "5,5" },
          labelStyle: { fontSize: 10, fontWeight: 400, fill: "#6b7280" }
        });
      })) : n.definition.onErrors && n.definition.onErrors.forEach((r) => {
        p.push({
          id: `edge-${n.name}-error-unexecuted-${r.errorRef}`,
          source: f,
          target: `state-${F(r)}`,
          type: "default",
          label: `error: ${r.errorRef}`,
          animated: !1,
          style: { stroke: "#d1d5db", strokeWidth: 2, strokeDasharray: "5,5" },
          labelStyle: { fontSize: 10, fontWeight: 400, fill: "#6b7280" }
        });
      });
    }
  }), { nodes: l, edges: p };
}, U = (a, l) => {
  if (!a)
    return { definition: a, execution: l, states: [], startState: "" };
  const p = /* @__PURE__ */ new Map();
  l && l.states.forEach((d) => {
    p.set(d.name, d);
  });
  const h = (a.states ?? []).map((d) => {
    const m = p.get(d.name), n = !!m, f = n ? !!(m.error || m.actions?.some((u) => u.error)) : !1;
    let c = 0;
    return n && m.startTime && m.endTime && (c = new Date(m.endTime).getTime() - new Date(m.startTime).getTime()), {
      name: d.name,
      type: d.type,
      definition: d,
      execution: m,
      wasExecuted: n,
      hasError: f,
      duration: c
    };
  });
  return { definition: a, execution: l, states: h, startState: a.start };
}, M = (a) => a < 1e3 ? `${a}ms` : `${(a / 1e3).toFixed(2)}s`, ee = (a, l, p = !0, h) => {
  const d = h?.colors ?? T;
  if (l) return d.error;
  if (!p) return d.unexecuted;
  switch (a) {
    case "operation":
      return d.operation;
    case "switch":
      return d.switch;
    default:
      return d.default;
  }
}, te = ({ isOpen: a, onClose: l, title: p, data: h, subtitle: d, darkMode: m = !1 }) => {
  const [n, f] = $.useState(!1);
  if ($.useEffect(() => {
    const s = (o) => {
      o.key === "Escape" && l();
    };
    return a && (document.addEventListener("keydown", s), document.body.style.overflow = "hidden"), () => {
      document.removeEventListener("keydown", s), document.body.style.overflow = "unset";
    };
  }, [a, l]), !a) return null;
  const c = JSON.stringify(h, null, 2);
  return me(
    /* @__PURE__ */ e("div", { className: `wf-root${m ? " wf-dark" : ""} json-modal-backdrop`, onClick: (s) => {
      s.target === s.currentTarget && l();
    }, children: /* @__PURE__ */ t("div", { className: "json-modal", children: [
      /* @__PURE__ */ t("div", { className: "json-modal-header", children: [
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("h2", { children: p }),
          d && /* @__PURE__ */ e("p", { className: "json-modal-subtitle", children: d })
        ] }),
        /* @__PURE__ */ t("div", { className: "json-modal-actions", children: [
          /* @__PURE__ */ t(
            "button",
            {
              className: "json-modal-copy-btn",
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(c), f(!0), setTimeout(() => f(!1), 2e3);
                } catch (s) {
                  console.error("Failed to copy:", s);
                }
              },
              title: "Copy JSON",
              children: [
                n ? /* @__PURE__ */ e(he, { size: 18 }) : /* @__PURE__ */ e(fe, { size: 18 }),
                n ? "Copied!" : "Copy"
              ]
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              className: "json-modal-close-btn",
              onClick: l,
              title: "Close",
              children: /* @__PURE__ */ e(X, { size: 20 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "json-modal-content", children: /* @__PURE__ */ e("pre", { className: "json-display", children: c }) })
    ] }) }),
    document.body
  );
}, ye = 45, we = 14, Ce = 46, G = 26, Ee = 4, K = (a) => ye + we + Ce + a * (G + Ee) + G / 2, Z = (a) => {
  if (a == null) return "null";
  const l = JSON.stringify(a) ?? "null";
  return l.length > 50 ? l.substring(0, 50) + "..." : l;
}, be = ({ data: a, onNodeClick: l, isSelected: p, id: h }) => {
  const d = ae(ie), [m, n] = se({
    isOpen: !1,
    title: "",
    data: null,
    subtitle: ""
  }), { label: f, state: c, duration: u, hasError: r, wasExecuted: s } = a, o = ee(c.type, r, s, d), C = () => {
    const N = { size: 16, style: { color: o } };
    switch (c.type) {
      case "operation":
        return /* @__PURE__ */ e(A, { ...N });
      case "switch":
        return /* @__PURE__ */ e(I, { ...N });
      default:
        return /* @__PURE__ */ e(Q, { ...N });
    }
  }, E = () => {
    n({ isOpen: !1, title: "", data: null, subtitle: "" });
  }, x = r ? "error" : c.type, S = p ? "selected" : "", g = c.execution, y = c.definition, i = (N) => {
    N.target.closest("button") || l?.(a, h || "");
  }, v = () => g ? /* @__PURE__ */ t(D, { children: [
    /* @__PURE__ */ t("div", { className: "node-meta", children: [
      /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(Y, { size: 14 }),
        /* @__PURE__ */ e("span", { children: M(u) })
      ] }),
      g.actions && g.actions.length > 0 && /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(A, { size: 14 }),
        /* @__PURE__ */ t("span", { children: [
          g.actions.length,
          " action",
          g.actions.length !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "node-summary", children: [
      c.type === "switch" && g.matchedCondition && /* @__PURE__ */ t("div", { className: "summary-item condition-item", children: [
        /* @__PURE__ */ e(I, { size: 12 }),
        /* @__PURE__ */ t("span", { children: [
          "Matched: ",
          g.matchedCondition
        ] })
      ] }),
      g.actions && g.actions.length > 0 && /* @__PURE__ */ e("div", { className: "summary-item actions-preview", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        g.actions.slice(0, 2).map((N, k) => /* @__PURE__ */ t("div", { className: "action-preview", children: [
          /* @__PURE__ */ e("span", { className: "action-preview-name", children: N.activityName }),
          /* @__PURE__ */ e("span", { className: "action-preview-duration", children: M(new Date(N.endTime).getTime() - new Date(N.startTime).getTime()) }),
          N.error && /* @__PURE__ */ e(P, { size: 10, className: "action-preview-error" })
        ] }, k)),
        g.actions.length > 2 && /* @__PURE__ */ t("div", { className: "action-preview more-actions", children: [
          "+",
          g.actions.length - 2,
          " more"
        ] })
      ] }) }),
      /* @__PURE__ */ e("div", { className: "summary-item data-preview", children: /* @__PURE__ */ t("div", { className: "data-preview-grid", children: [
        /* @__PURE__ */ t("div", { className: "data-preview-item", children: [
          /* @__PURE__ */ e("span", { className: "data-label", children: "Input" }),
          /* @__PURE__ */ e("span", { className: "data-preview-text", children: Z(g.input) })
        ] }),
        /* @__PURE__ */ t("div", { className: "data-preview-item", children: [
          /* @__PURE__ */ e("span", { className: "data-label", children: "Output" }),
          /* @__PURE__ */ e("span", { className: "data-preview-text", children: Z(g.output) })
        ] })
      ] }) })
    ] })
  ] }) : null, w = () => /* @__PURE__ */ t(D, { children: [
    /* @__PURE__ */ t("div", { className: "node-meta", children: [
      /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(L, { size: 14 }),
        /* @__PURE__ */ e("span", { children: "Not executed" })
      ] }),
      y.actions && y.actions.length > 0 && /* @__PURE__ */ t("div", { className: "meta-item", children: [
        /* @__PURE__ */ e(A, { size: 14 }),
        /* @__PURE__ */ t("span", { children: [
          y.actions.length,
          " planned action",
          y.actions.length !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "node-summary", children: [
      c.type === "switch" && y.dataConditions && /* @__PURE__ */ e("div", { className: "summary-item", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        y.dataConditions.map((N, k) => /* @__PURE__ */ t("div", { className: "condition-item unexecuted", children: [
          /* @__PURE__ */ e(I, { size: 12 }),
          /* @__PURE__ */ e("span", { children: N.name ? `${N.name}: ${N.condition}` : N.condition })
        ] }, k)),
        y.defaultCondition && /* @__PURE__ */ t("div", { className: "condition-item unexecuted", children: [
          /* @__PURE__ */ e(I, { size: 12 }),
          /* @__PURE__ */ e("span", { children: "default: fallback" })
        ] })
      ] }) }),
      y.actions && y.actions.length > 0 && /* @__PURE__ */ e("div", { className: "summary-item actions-preview", children: /* @__PURE__ */ t("div", { className: "actions-list", children: [
        y.actions.slice(0, 2).map((N, k) => /* @__PURE__ */ t("div", { className: "action-preview unexecuted", children: [
          /* @__PURE__ */ e("span", { className: "action-preview-name", children: N.functionRef.refName }),
          /* @__PURE__ */ e("span", { className: "action-preview-duration", children: "planned" })
        ] }, k)),
        y.actions.length > 2 && /* @__PURE__ */ t("div", { className: "action-preview more-actions", children: [
          "+",
          y.actions.length - 2,
          " more planned"
        ] })
      ] }) })
    ] })
  ] }), W = () => {
    const N = y.dataConditions ?? [], k = g?.matchedCondition;
    return /* @__PURE__ */ t(D, { children: [
      N.map((O, b) => {
        const z = s && !!(k && (k === O.name || k === O.condition));
        return /* @__PURE__ */ e(
          j,
          {
            type: "source",
            position: H.Right,
            id: `condition-${b}`,
            style: { top: K(b) },
            className: `condition-handle ${z ? "executed-handle" : "unexecuted-handle"}`
          },
          `condition-${b}`
        );
      }),
      y.defaultCondition && (() => {
        const O = s && k === "default";
        return /* @__PURE__ */ e(
          j,
          {
            type: "source",
            position: H.Right,
            id: "condition-default",
            style: { top: K(N.length) },
            className: `condition-handle ${O ? "default-executed-handle" : "default-handle"}`
          },
          "condition-default"
        );
      })()
    ] });
  };
  return /* @__PURE__ */ t(D, { children: [
    /* @__PURE__ */ t("div", { className: `workflow-node ${x} ${S}`, onClick: i, children: [
      /* @__PURE__ */ e(j, { type: "target", position: H.Left }),
      /* @__PURE__ */ e("div", { className: "node-header", children: /* @__PURE__ */ t("div", { className: "node-title", children: [
        s ? /* @__PURE__ */ e(q, { size: 16, className: "success-icon" }) : /* @__PURE__ */ e(L, { size: 16, className: "unexecuted-icon" }),
        C(),
        /* @__PURE__ */ e("span", { children: f }),
        r && /* @__PURE__ */ e(P, { size: 16, className: "error-icon" })
      ] }) }),
      /* @__PURE__ */ e("div", { className: "node-content", children: s ? v() : w() }),
      c.type !== "switch" && /* @__PURE__ */ e(j, { type: "source", position: H.Right }),
      /* @__PURE__ */ e(
        te,
        {
          isOpen: m.isOpen,
          onClose: E,
          title: m.title,
          data: m.data,
          subtitle: m.subtitle
        }
      )
    ] }),
    c.type === "switch" && W()
  ] });
}, ne = {
  colors: {
    executed: "#10b981",
    unexecuted: "#9ca3af",
    error: "#ef4444",
    operation: "#10b981",
    switch: "#f59e0b",
    default: "#6366f1"
  }
}, xe = {
  colors: {
    executed: "#34d399",
    unexecuted: "#9ca3af",
    error: "#f87171",
    operation: "#34d399",
    switch: "#fbbf24",
    default: "#818cf8"
  }
}, ie = $.createContext(ne), Se = ({
  workflow: a,
  execution: l,
  onNodeClick: p,
  selectedNodeId: h = null,
  theme: d,
  darkMode: m = !1,
  fitView: n = !0,
  minZoom: f = 0.3,
  maxZoom: c = 2,
  className: u,
  style: r
}) => {
  const s = _(() => ({ colors: { ...(m ? xe : ne).colors, ...d?.colors } }), [d, m]), o = $.useCallback((b) => {
    const z = h === b.id;
    return /* @__PURE__ */ e(be, { ...b, onNodeClick: p, isSelected: z });
  }, [p, h]), C = $.useMemo(() => ({
    workflowNode: o
  }), [o]), E = _(() => U(a, l), [a, l]), { nodes: x, edges: S } = _(
    () => B(E),
    [E]
  ), [g, y, i] = re(x), [v, w, W] = oe(S), [N, k] = $.useState(null);
  $.useEffect(() => {
    const { nodes: b, edges: z } = B(
      U(a, l)
    );
    y(b), w(z), N && setTimeout(() => N.fitView(), 100);
  }, [a, l, y, w, N]);
  const O = ["wf-root", m ? "wf-dark" : "", u].filter(Boolean).join(" ");
  return /* @__PURE__ */ e(ie.Provider, { value: s, children: /* @__PURE__ */ e(
    "div",
    {
      className: O,
      style: { width: "100%", height: "100%", minHeight: "400px", ...r },
      children: /* @__PURE__ */ t(
        ce,
        {
          nodes: g,
          edges: v,
          onNodesChange: i,
          onEdgesChange: W,
          nodeTypes: C,
          fitView: n,
          fitViewOptions: { padding: 100, minZoom: f, maxZoom: c },
          defaultViewport: { x: 0, y: 0, zoom: 0.8 },
          attributionPosition: "bottom-left",
          proOptions: { hideAttribution: !0 },
          onInit: (b) => {
            k(b), setTimeout(() => b.fitView(), 100);
          },
          panOnScroll: !0,
          zoomOnScroll: !0,
          zoomOnPinch: !0,
          panOnScrollSpeed: 0.85,
          children: [
            /* @__PURE__ */ e(de, { position: "bottom-left" }),
            /* @__PURE__ */ e(
              le,
              {
                position: "bottom-right",
                bgColor: m ? "#111827" : "#f8fafc",
                maskColor: m ? "rgba(0, 0, 0, 0.5)" : "rgba(240, 240, 240, 0.6)",
                nodeColor: (b) => {
                  const z = b.data;
                  return ee(
                    z?.state?.type ?? "",
                    z?.hasError ?? !1,
                    z?.wasExecuted ?? !0,
                    s
                  );
                }
              }
            ),
            /* @__PURE__ */ e(ue, { variant: "dots", gap: 16, size: 1, color: m ? "#374151" : "#d1d5db" })
          ]
        },
        `workflow-${g.length}-${v.length}`
      )
    }
  ) });
}, ke = ({ isOpen: a, nodeData: l, onClose: p, darkMode: h = !1 }) => {
  const [d, m] = $.useState({
    isOpen: !1,
    title: "",
    data: null,
    subtitle: ""
  });
  if (!a || !l) return null;
  const { label: n, state: f, duration: c, hasError: u, wasExecuted: r } = l, s = f.execution, o = f.definition, C = (i, v) => !i || !v ? !1 : i.toLowerCase().includes(v.toLowerCase()), x = (() => {
    if (!u || !o.onErrors || !s) return null;
    const i = s.error || s.actions?.find((w) => w.error)?.error;
    if (!i) return null;
    const v = o.onErrors.find(
      (w) => w.errorRef !== "DefaultErrorRef" && C(i, w.errorRef)
    );
    return v || o.onErrors.find((w) => w.errorRef === "DefaultErrorRef");
  })(), S = (i, v, w) => {
    m({ isOpen: !0, title: i, data: v, subtitle: w });
  }, g = () => {
    m({ isOpen: !1, title: "", data: null, subtitle: "" });
  };
  return /* @__PURE__ */ e(D, { children: a && /* @__PURE__ */ t(D, { children: [
    /* @__PURE__ */ e("div", { className: "panel-overlay", onClick: p }),
    /* @__PURE__ */ t("div", { className: "node-detail-panel open", children: [
      /* @__PURE__ */ t("div", { className: "panel-header", children: [
        /* @__PURE__ */ t("div", { className: "panel-title", children: [
          /* @__PURE__ */ t("div", { className: "title-main", children: [
            r ? /* @__PURE__ */ e(q, { size: 18, className: "success-icon" }) : /* @__PURE__ */ e(L, { size: 18, className: "unexecuted-icon" }),
            (() => {
              const i = { size: 20 };
              switch (f.type) {
                case "operation":
                  return /* @__PURE__ */ e(A, { ...i });
                case "switch":
                  return /* @__PURE__ */ e(I, { ...i });
                default:
                  return /* @__PURE__ */ e(Q, { ...i });
              }
            })(),
            /* @__PURE__ */ e("span", { className: "node-name", children: n }),
            u && /* @__PURE__ */ e(P, { size: 18, className: "error-icon" })
          ] }),
          /* @__PURE__ */ t("div", { className: "title-meta", children: [
            /* @__PURE__ */ e("span", { className: `node-status ${r ? "executed" : "unexecuted"}`, children: r ? "Executed" : "Not Executed" }),
            /* @__PURE__ */ e("span", { className: "node-type-badge", children: f.type })
          ] })
        ] }),
        /* @__PURE__ */ e("button", { className: "panel-close", onClick: p, children: /* @__PURE__ */ e(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ t("div", { className: "panel-content", children: [
        /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Execution Summary" }),
          /* @__PURE__ */ t("div", { className: "summary-grid", children: [
            /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(Y, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Duration" }),
              /* @__PURE__ */ e("span", { className: "value", children: r ? M(c) : "N/A" })
            ] }),
            s?.actions && /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(A, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Actions" }),
              /* @__PURE__ */ e("span", { className: "value", children: s.actions.length })
            ] }),
            !r && o.actions && /* @__PURE__ */ t("div", { className: "summary-item", children: [
              /* @__PURE__ */ e(A, { size: 16 }),
              /* @__PURE__ */ e("span", { className: "label", children: "Planned Actions" }),
              /* @__PURE__ */ e("span", { className: "value", children: o.actions.length })
            ] })
          ] })
        ] }),
        f.type === "switch" && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Switch Conditions" }),
          r && s?.matchedCondition ? /* @__PURE__ */ e("div", { className: "condition-result", children: /* @__PURE__ */ t("div", { className: "matched-condition", children: [
            /* @__PURE__ */ e(pe, { size: 16, className: "success-icon" }),
            /* @__PURE__ */ t("span", { children: [
              "Matched: ",
              /* @__PURE__ */ e("strong", { children: s.matchedCondition })
            ] })
          ] }) }) : null,
          o.dataConditions && /* @__PURE__ */ t("div", { className: "conditions-list", children: [
            o.dataConditions.map((i, v) => /* @__PURE__ */ t(
              "div",
              {
                className: `condition-item ${r && (s?.matchedCondition === i.name || s?.matchedCondition === i.condition) ? "matched" : "unmatched"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "condition-header", children: [
                    /* @__PURE__ */ e("span", { className: "condition-name", children: i.name ?? i.condition }),
                    r && (s?.matchedCondition === i.name || s?.matchedCondition === i.condition) && /* @__PURE__ */ e("span", { className: "condition-badge", children: "Matched" })
                  ] }),
                  /* @__PURE__ */ e("div", { className: "condition-expression", children: i.condition }),
                  /* @__PURE__ */ t("div", { className: "condition-target", children: [
                    "→ ",
                    typeof i.transition == "string" ? i.transition : i.transition.nextState
                  ] })
                ]
              },
              v
            )),
            o.defaultCondition && /* @__PURE__ */ t(
              "div",
              {
                className: `condition-item ${r && s?.matchedCondition === "default" ? "matched" : "unmatched"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "condition-header", children: [
                    /* @__PURE__ */ e("span", { className: "condition-name", children: "default" }),
                    r && s?.matchedCondition === "default" && /* @__PURE__ */ e("span", { className: "condition-badge", children: "Matched" })
                  ] }),
                  /* @__PURE__ */ e("div", { className: "condition-expression", children: "fallback condition" }),
                  /* @__PURE__ */ t("div", { className: "condition-target", children: [
                    "→ ",
                    typeof o.defaultCondition.transition == "string" ? o.defaultCondition.transition : o.defaultCondition.transition.nextState
                  ] })
                ]
              }
            )
          ] })
        ] }),
        o.onErrors && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Error Handlers" }),
          u && x && /* @__PURE__ */ e("div", { className: "error-handler-result", children: /* @__PURE__ */ t("div", { className: "triggered-handler", children: [
            /* @__PURE__ */ e(J, { size: 16, className: "error-icon" }),
            /* @__PURE__ */ t("span", { children: [
              "Triggered: ",
              /* @__PURE__ */ e("strong", { children: x.errorRef })
            ] })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "error-handlers-list", children: o.onErrors.map((i, v) => {
            const w = u && x?.errorRef === i.errorRef, W = typeof i.transition == "string" ? i.transition : i.transition.nextState;
            return /* @__PURE__ */ t(
              "div",
              {
                className: `error-handler-item ${w ? "triggered" : "not-triggered"}`,
                children: [
                  /* @__PURE__ */ t("div", { className: "error-handler-header", children: [
                    /* @__PURE__ */ t("div", { className: "error-handler-name", children: [
                      w ? /* @__PURE__ */ e(J, { size: 16, className: "error-icon" }) : /* @__PURE__ */ e(Ne, { size: 16, className: "shield-icon" }),
                      /* @__PURE__ */ e("span", { children: i.errorRef })
                    ] }),
                    w && /* @__PURE__ */ e("span", { className: "error-handler-badge", children: "Triggered" })
                  ] }),
                  /* @__PURE__ */ t("div", { className: "error-handler-target", children: [
                    "→ ",
                    W
                  ] })
                ]
              },
              v
            );
          }) })
        ] }),
        (r && s?.actions || !r && o.actions) && /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: r ? "Executed Actions" : "Planned Actions" }),
          /* @__PURE__ */ e("div", { className: "actions-detail", children: r && s?.actions ? s.actions.map((i, v) => /* @__PURE__ */ t("div", { className: "action-detail-item", children: [
            /* @__PURE__ */ t("div", { className: "action-header", children: [
              /* @__PURE__ */ e("span", { className: "action-name", children: i.activityName }),
              /* @__PURE__ */ t("div", { className: "action-meta", children: [
                /* @__PURE__ */ e("span", { className: "action-duration", children: M(new Date(i.endTime).getTime() - new Date(i.startTime).getTime()) }),
                i.error && /* @__PURE__ */ e(P, { size: 14, className: "error-icon" })
              ] })
            ] }),
            /* @__PURE__ */ t("div", { className: "action-buttons", children: [
              /* @__PURE__ */ t(
                "button",
                {
                  className: "detail-button",
                  onClick: () => S(
                    `${n} > ${i.activityName} - Arguments`,
                    i.arguments,
                    "Action input arguments"
                  ),
                  children: [
                    /* @__PURE__ */ e(R, { size: 14 }),
                    "Arguments"
                  ]
                }
              ),
              /* @__PURE__ */ t(
                "button",
                {
                  className: `detail-button ${i.error ? "error" : ""}`,
                  onClick: () => S(
                    `${n} > ${i.activityName} - ${i.error ? "Error" : "Output"}`,
                    i.output || i.error,
                    i.error ? "Action error details" : "Action output data"
                  ),
                  children: [
                    /* @__PURE__ */ e(R, { size: 14 }),
                    i.error ? "Error" : "Output"
                  ]
                }
              )
            ] })
          ] }, v)) : o.actions?.map((i, v) => /* @__PURE__ */ t("div", { className: "action-detail-item planned", children: [
            /* @__PURE__ */ t("div", { className: "action-header", children: [
              /* @__PURE__ */ e("span", { className: "action-name", children: i.functionRef.refName }),
              /* @__PURE__ */ e("div", { className: "action-meta", children: /* @__PURE__ */ e("span", { className: "action-duration", children: "planned" }) })
            ] }),
            /* @__PURE__ */ e("div", { className: "action-buttons", children: /* @__PURE__ */ t(
              "button",
              {
                className: "detail-button",
                onClick: () => S(
                  `${n} > ${i.functionRef.refName} - Arguments`,
                  i.functionRef.arguments,
                  "Planned action arguments"
                ),
                children: [
                  /* @__PURE__ */ e(R, { size: 14 }),
                  "Arguments"
                ]
              }
            ) })
          ] }, v)) })
        ] }),
        /* @__PURE__ */ t("div", { className: "detail-section", children: [
          /* @__PURE__ */ e("h3", { children: "Data" }),
          /* @__PURE__ */ e("div", { className: "data-detail", children: r && s ? /* @__PURE__ */ t(D, { children: [
            /* @__PURE__ */ t("div", { className: "data-item", children: [
              /* @__PURE__ */ t("div", { className: "data-header", children: [
                /* @__PURE__ */ e("span", { children: "Input Data" }),
                /* @__PURE__ */ t(
                  "button",
                  {
                    className: "detail-button small",
                    onClick: () => S(`${n} - Input`, s.input, "State input data"),
                    children: [
                      /* @__PURE__ */ e(R, { size: 12 }),
                      "View Full"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ e("pre", { className: "data-preview", children: (() => {
                const i = JSON.stringify(s.input ?? null, null, 2);
                return i.length > 200 ? i.substring(0, 200) + "..." : i;
              })() })
            ] }),
            /* @__PURE__ */ t("div", { className: "data-item", children: [
              /* @__PURE__ */ t("div", { className: "data-header", children: [
                /* @__PURE__ */ e("span", { children: "Output Data" }),
                /* @__PURE__ */ t(
                  "button",
                  {
                    className: "detail-button small",
                    onClick: () => S(`${n} - Output`, s.output, "State output data"),
                    children: [
                      /* @__PURE__ */ e(R, { size: 12 }),
                      "View Full"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ e("pre", { className: "data-preview", children: (() => {
                const i = JSON.stringify(s.output ?? null, null, 2);
                return i.length > 200 ? i.substring(0, 200) + "..." : i;
              })() })
            ] })
          ] }) : /* @__PURE__ */ t("div", { className: "data-item", children: [
            /* @__PURE__ */ t("div", { className: "data-header", children: [
              /* @__PURE__ */ e("span", { children: "Definition" }),
              /* @__PURE__ */ t(
                "button",
                {
                  className: "detail-button small",
                  onClick: () => S(`${n} - Definition`, o, "State definition"),
                  children: [
                    /* @__PURE__ */ e(R, { size: 12 }),
                    "View Full"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e("pre", { className: "data-preview", children: (() => {
              const i = JSON.stringify(o ?? null, null, 2);
              return i.length > 200 ? i.substring(0, 200) + "..." : i;
            })() })
          ] }) })
        ] }),
        u && r && s && /* @__PURE__ */ t("div", { className: "detail-section error-section", children: [
          /* @__PURE__ */ e("h3", { children: "Error Details" }),
          /* @__PURE__ */ t("div", { className: "error-details", children: [
            s.error && /* @__PURE__ */ e("div", { className: "error-message", children: s.error }),
            s.actions?.map(
              (i, v) => i.error && /* @__PURE__ */ t("div", { className: "error-message", children: [
                /* @__PURE__ */ t("strong", { children: [
                  i.activityName,
                  ":"
                ] }),
                " ",
                i.error
              ] }, v)
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(
      te,
      {
        isOpen: d.isOpen,
        onClose: g,
        title: d.title,
        data: d.data,
        subtitle: d.subtitle,
        darkMode: h
      }
    )
  ] }) });
}, Re = ({
  workflow: a,
  execution: l,
  onNodeClick: p,
  showDetailPanel: h = !0,
  renderDetailPanel: d,
  theme: m,
  darkMode: n = !1,
  fitView: f = !0,
  minZoom: c = 0.3,
  maxZoom: u = 2,
  className: r,
  style: s
}) => {
  const [o, C] = $.useState({
    isOpen: !1,
    nodeData: null,
    selectedNodeId: null
  }), E = $.useCallback((g, y) => {
    p?.(g), (h || d) && C({ isOpen: !0, nodeData: g, selectedNodeId: y });
  }, [p, h, d]), x = $.useCallback(() => {
    C({ isOpen: !1, nodeData: null, selectedNodeId: null });
  }, []), S = ["wf-root", n ? "wf-dark" : "", r].filter(Boolean).join(" ");
  return /* @__PURE__ */ t("div", { style: { width: "100%", height: "100%", minHeight: "400px", ...s }, className: S, children: [
    /* @__PURE__ */ e(
      Se,
      {
        workflow: a,
        execution: l,
        onNodeClick: E,
        selectedNodeId: o.selectedNodeId,
        theme: m,
        darkMode: n,
        fitView: f,
        minZoom: c,
        maxZoom: u
      }
    ),
    d && o.isOpen && o.nodeData ? d(o.nodeData, x) : h && /* @__PURE__ */ e(
      ke,
      {
        isOpen: o.isOpen,
        nodeData: o.nodeData,
        onClose: x,
        darkMode: n
      }
    )
  ] });
};
export {
  te as JsonModal,
  ke as NodeDetailPanel,
  Se as WorkflowGraph,
  be as WorkflowNode,
  Re as WorkflowVisualizer,
  U as combineWorkflowData,
  M as formatDuration,
  ee as getNodeTypeColor,
  B as parseCombinedWorkflowData
};
//# sourceMappingURL=datadancer-visualizer.js.map
