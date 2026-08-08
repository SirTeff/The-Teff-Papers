import "server-only";
import { getMarginEnvironmentStatus } from "./margin-environment";

const marginEnvironment = getMarginEnvironmentStatus(process.env);

export const features = Object.freeze({
  marginEnabled: marginEnvironment.enabled,
});
