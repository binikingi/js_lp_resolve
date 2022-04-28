"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_joda_1 = require("js-joda");
const lpsolve = __importStar(require("lp_solve"));
function solveIt(visits, authorizations) {
    const lp = new lpsolve.LinearProgram();
    lp.modelNames = false;
    lp.localConstraints = false;
    lp.setVerbose(0);
    for (const visit of visits) {
        for (const authorization of authorizations) {
            if (!visit.date.isBefore(authorization.startDate) &&
                !visit.date.isAfter(authorization.endDate)) {
                lp.addColumn(visitAllocationVariableName(visit, authorization));
            }
        }
    }
    const objectiveRow = new lpsolve.Row();
    for (const varName of Object.keys(lp.Columns)) {
        objectiveRow.Add(varName, 1);
    }
    lp.setObjective(objectiveRow, false);
    for (const visit of visits) {
        const row = new lpsolve.Row();
        for (const authorization of authorizations) {
            const varName = visitAllocationVariableName(visit, authorization);
            if (varName in lp.Columns) {
                row.Add(varName, 1);
            }
        }
        if (Object.keys(row.raw).length > 0) {
            lp.addConstraint(row, "LE", visit.minutes);
        }
    }
    for (const auth of authorizations) {
        const row = new lpsolve.Row();
        for (const visit of visits) {
            const varName = visitAllocationVariableName(visit, auth);
            if (varName in lp.Columns) {
                row.Add(varName, 1);
            }
        }
        lp.addConstraint(row, "LE", auth.minutes);
    }
    const initialSol = lp.solve();
    console.log(lp.dumpProgram());
    for (const varName of Object.keys(lp.Columns)) {
        console.log(varName, lp.get(varName));
    }
}
function visitAllocationVariableName(visit, auth) {
    return `v_${visit.id}-a_${auth.id}`;
}
const visits = [
    {
        id: 1,
        date: js_joda_1.LocalDate.now(),
        minutes: 60,
    },
    {
        id: 2,
        date: js_joda_1.LocalDate.now(),
        minutes: 60,
    },
    {
        id: 3,
        date: js_joda_1.LocalDate.now().plusDays(1),
        minutes: 60,
    },
    {
        id: 4,
        date: js_joda_1.LocalDate.now().plusDays(2),
        minutes: 60,
    },
];
const authorizations = [
    {
        id: 3,
        startDate: js_joda_1.LocalDate.now().plusDays(2),
        endDate: js_joda_1.LocalDate.now().plusDays(2),
        minutes: 30,
    },
    {
        id: 2,
        startDate: js_joda_1.LocalDate.now(),
        endDate: js_joda_1.LocalDate.now().plusDays(2),
        minutes: 120,
    },
    {
        id: 1,
        startDate: js_joda_1.LocalDate.now(),
        endDate: js_joda_1.LocalDate.now().plusDays(2),
        minutes: 90,
    },
];
solveIt(visits, authorizations);
