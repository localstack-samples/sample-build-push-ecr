import {Construct} from "constructs";
import {App, TerraformStack} from "cdktf";
import {AwsProvider} from "@cdktf/provider-aws/lib/provider";
import {S3Bucket} from "@cdktf/provider-aws/lib/s3-bucket"
import {EcrRepository} from "@cdktf/provider-aws/lib/ecr-repository"
import {DockerProvider} from "@cdktf/provider-docker/lib/provider";
import {Image} from "@cdktf/provider-docker/lib/image";
import {RegistryImage} from "@cdktf/provider-docker/lib/registry-image";
// import {Container} from "@cdktf/provider-docker/lib/container";
import * as path from 'path';
import {hashFolder} from "./hashing";

import {endpoints} from "./ls-endpoints";
import {TerraformOutput} from "cdktf/lib";

(async () => {

    const dockerAppDir: string = path.resolve() + '/../../../app';
    const dockerAppHash: string = await hashFolder(dockerAppDir);
    console.log(dockerAppHash);

    class MyStack extends TerraformStack {
        constructor(scope: Construct, id: string) {
            super(scope, id);

            // define resources here
            new AwsProvider(this, "AWS", {
                region: "us-east-1",
                accessKey: 'test',
                secretKey: 'test',
                s3UsePathStyle: true,
                endpoints: endpoints
            });

            new DockerProvider(this, "docker", {
                registryAuth: [
                    {
                        address: 'localhost.localstack.cloud:4510',
                        username: 'test',
                        password: 'test'
                    }
                ],

            });

            const myecr = new EcrRepository(this, 'myrep', {
                name: 'myrepo',
                imageScanningConfiguration: {scanOnPush: true},

            });

            const myimage = new Image(this, "myimage", {
                name: `${myecr.repositoryUrl}:latest`,
                buildAttribute: {context: dockerAppDir},
                keepLocally: false,
                forceRemove: true,
                triggers: {'hash': dockerAppHash}
            });

            new TerraformOutput(this, "myimageUrl", {
                value: myecr.repositoryUrl,
            });

            new TerraformOutput(this, "myimageName", {
                value: myimage.name,
            });

            new RegistryImage(this, 'myecrimage', {
                name: myimage.name,
                insecureSkipVerify: true,
                triggers: {'hash': dockerAppHash}
            });

            new S3Bucket(this, "bucket", {
                bucket: "demo"
            });
        }
    }


    const app = new App();
    new MyStack(app, "cdk");
    app.synth();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(e);
});

