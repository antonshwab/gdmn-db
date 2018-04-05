export type TExecutor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);
