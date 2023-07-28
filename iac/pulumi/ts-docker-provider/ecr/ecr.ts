import * as aws from "@pulumi/aws";
import {mkItemName, mkTagsWithName, PulumiUtil, stackEnv} from "../iac-shared";
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import path from "path";

// const dockerAppDir: string = path.resolve() + '/../../../../app';
const dockerAppDir: string = '../../../../app';

const myrepo = new awsx.ecr.Repository("myrepo", {
    imageScanningConfiguration: {
        scanOnPush: true,
    },
    imageTagMutability: "MUTABLE",
}, {provider: PulumiUtil.instance().awsProvider});


const myAppImage = new docker.Image("myimage", {
    build: {
        context: dockerAppDir,
        // dockerfile: `Dockerfile`,
    },
    imageName: pulumi.interpolate`${myrepo.url}:latest`,
    registry: {
        server: myrepo.url,
    },
});
export const imageName = myAppImage.imageName;
export const myrepourl = myrepo.url;
