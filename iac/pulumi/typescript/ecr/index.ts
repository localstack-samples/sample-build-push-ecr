import * as pulumi from "@pulumi/pulumi";
import {stackEnv} from "../iac-shared";

export const toplevelStackRef = new pulumi.StackReference(`toplevel.${stackEnv}`);

export * from "./ecr";

