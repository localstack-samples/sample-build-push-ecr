import * as aws from "@pulumi/aws";
import {mkItemName, mkTagsWithName, PulumiUtil, stackEnv} from "../iac-shared";
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const myrepo = new awsx.ecr.Repository("myrepo", {
    imageScanningConfiguration: {
        scanOnPush: true,
    },
    // encryptionConfigurations:
    imageTagMutability: "MUTABLE",
}, {provider: PulumiUtil.instance().awsProvider});

const image = new awsx.ecr.Image("image", {
    repositoryUrl: myrepo.url,
    path: "../../../../app",
}, {provider: PulumiUtil.instance().awsProvider});
export const myrepourl = myrepo.url;