import { Container } from "inversify";
const myContainer = new Container();

const func = () => {
  console.log("hello world");
};

describe("inversify", () => {
  it("hello world inversify", () => {
    myContainer.bind<() => void>("func").toConstantValue(func);
    const res = myContainer.get<() => void>("func");
    res();
  });
});
