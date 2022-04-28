import { LocalDate } from "js-joda";
import * as lpsolve from "lp_solve";

interface Authorization {
  id: number;
  startDate: LocalDate;
  endDate: LocalDate;
  minutes: number;
}

interface Visit {
  id: number;
  date: LocalDate;
  minutes: number;
}

function solveIt(visits: Visit[], authorizations: Authorization[]) {
  const lp = new lpsolve.LinearProgram();
  lp.modelNames = false;
  lp.localConstraints = false;
  lp.setVerbose(0);

  for (const visit of visits) {
    for (const authorization of authorizations) {
      if (
        !visit.date.isBefore(authorization.startDate) &&
        !visit.date.isAfter(authorization.endDate)
      ) {
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

function visitAllocationVariableName(
  visit: Visit,
  auth: Authorization
): string {
  return `v_${visit.id}-a_${auth.id}`;
}

const visits: Visit[] = [
  {
    id: 1,
    date: LocalDate.now(),
    minutes: 60,
  },
  {
    id: 2,
    date: LocalDate.now(),
    minutes: 60,
  },
  {
    id: 3,
    date: LocalDate.now().plusDays(1),
    minutes: 60,
  },
  {
    id: 4,
    date: LocalDate.now().plusDays(2),
    minutes: 60,
  },
];

const authorizations: Authorization[] = [
  {
    id: 3,
    startDate: LocalDate.now().plusDays(2),
    endDate: LocalDate.now().plusDays(2),
    minutes: 30,
  },
  {
    id: 2,
    startDate: LocalDate.now(),
    endDate: LocalDate.now().plusDays(2),
    minutes: 120,
  },
  {
    id: 1,
    startDate: LocalDate.now(),
    endDate: LocalDate.now().plusDays(2),
    minutes: 90,
  },
];

solveIt(visits, authorizations);
