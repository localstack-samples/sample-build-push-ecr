import {Construct} from "constructs";
import {App, TerraformStack, S3Backend} from "cdktf";
import {AwsProvider} from "@cdktf/provider-aws/lib/provider";
// import {S3Bucket} from "@cdktf/provider-aws/lib/s3-bucket"
import {EcrRepository} from "@cdktf/provider-aws/lib/ecr-repository"
import {DockerProvider} from "@cdktf/provider-docker/lib/provider";
import {Image} from "@cdktf/provider-docker/lib/image";
import {RegistryImage} from "@cdktf/provider-docker/lib/registry-image";
// import {Container} from "@cdktf/provider-docker/lib/container";
import * as path from 'path';
import {hashFolder} from "./hashing";

import {endpoints} from "./ls-endpoints";
import {TerraformOutput} from "cdktf/lib";
import {DataAwsEcrAuthorizationToken} from "@cdktf/provider-aws/lib/data-aws-ecr-authorization-token";

(async () => {

    const dockerAppDir: string = path.resolve() + '/../../../app';
    const dockerAppHash: string = await hashFolder(dockerAppDir);
    console.log(dockerAppHash);

    interface MyMultiStackConfig {
        isLocal: boolean;
        environment: string;
        region?: string;
    }


    class MyStack extends TerraformStack {
        constructor(scope: Construct, id: string, config: MyMultiStackConfig) {
            super(scope, id);
            // Default Docker registry auth for LocalStack Docker Desktop
            let registryAuth: any = {
                username: 'test',
                password: 'test',
                authDisabled: true
            };
            console.log('config', config);
            console.log(registryAuth.username);
            // define resources here
            if (config.isLocal) {
                console.log("LocalStack Deploy");
                // LocalStack AWS Provider
                new AwsProvider(this, "AWS", {
                    region: config.region,
                    accessKey: 'test',
                    secretKey: 'test',
                    s3UsePathStyle: true,
                    endpoints: endpoints
                });


            } else {
                console.log("AWS Deploy");
                // AWS Live Deploy
                // Use S3Backend
                new S3Backend(this, {
                    bucket: process.env.TERRAFORM_STATE_BUCKET ?? '',
                    key: id,
                    region: config.region
                });
                // Use AWS Provider with no LocalStack overrides
                new AwsProvider(this, "AWS", {
                    region: config.region
                });
                // Change registry auth for AWS ECR Credentials helper
                registryAuth = {
                    configFile: path.resolve() + '/dockerconfig.json'
                }
            }

            const myecr = new EcrRepository(this, 'myrepo', {
                name: 'myrepo',
                imageScanningConfiguration: {scanOnPush: true},
                tags: {
                    environment: config.environment,
                }
            });

            const auth = new DataAwsEcrAuthorizationToken(this, `ecr-auth`,
                {
                    dependsOn: [myecr],
                    registryId: myecr.registryId,
                });

            console.log(`auth username ${auth.userName}`);
            console.log('ecr url', myecr.repositoryUrl);
            // registryAuth = Object.assign({}, registryAuth, {address: `${myecr.repositoryUrl}`});
            registryAuth = Object.assign({}, registryAuth, {address: `${auth.proxyEndpoint}`});
            console.log(`registry auth: `, registryAuth);
            new DockerProvider(this, "docker", {

                registryAuth: [
                    registryAuth
                ],
                // registryAuth: [
                //     {
                //         address: auth.proxyEndpoint,
                //         username: auth.userName,
                //         password: auth.password
                //     }
                // ]
            });

            const myimage = new Image(this, "myimage", {
                name: `${myecr.repositoryUrl}:latest`,
                // name: `${auth.proxyEndpoint}/${myecr.name}:latest`,
                buildAttribute: {context: dockerAppDir},
                keepLocally: false,
                forceRemove: true,
                triggers: {'hash': dockerAppHash},
            });

            new TerraformOutput(this, "myimageUrl", {
                value: myecr.repositoryUrl,
            });

            new TerraformOutput(this, "myimageName", {
                value: myimage.name,
            });

            new TerraformOutput(this, "proxyOtherName", {
                value: `${auth.proxyEndpoint}/${myecr.name}:latest`,
            });

            new RegistryImage(this, 'myecrimage', {
                name: myimage.name,
                insecureSkipVerify: true,
                triggers: {'hash': dockerAppHash},
            });
        }
    }


    const app = new App();
    new MyStack(app, "lsecr.local", {
        isLocal: true,
        environment: 'local',
        region: 'us-east-1'
    });
    new MyStack(app, "lsecr.non", {
        isLocal: false,
        environment: 'non',
        region: 'us-east-1'
    });
    app.synth();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(e);
});

