# ﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿Building OpenFaas

The instructions provided below specify the steps to build OpenFaas and OpenFaas Cloud components on Linux on IBM Z for following distributions:
*	RHEL (7.6)

_**General Notes:**_   
* _When following the steps below please use a super user unless otherwise specified._  
* _A directory `/<source_root>/` will be referred to in these instructions, this is a temporary writable directory anywhere you'd like to place it._

### Prerequisites 
 * Docker  
 * Kubernetes Cluster v1.13.2 Setup

### Step 1: Install dependencies

   ```shell
     export SOURCE_ROOT=/<source_root>/
     yum install -y make curl tar wget
   ```
*    Install Go 1.11.4
	 ```shell
	 wget https://raw.githubusercontent.com/linux-on-ibm-z/scripts/master/Go/build_go.sh
	 bash build_go.sh -v 1.11.4
	 mkdir $SOURCE_ROOT/go
	 export GOPATH=$SOURCE_ROOT/go
	 ``` 
	 
### Step 2: Build OpenFaas Components

*  #### Build `openfaas/gateway` image

	*   Download the source code
           ```shell
           go get github.com/openfaas/faas/gateway
           cd $GOPATH/src/github.com/openfaas/faas/gateway
           git checkout tags/0.13.4
           ```
	   
	*   Create Dockerfile named `Dockerfile.gate-s390x` with following content	 
        
          ```diff
          FROM s390x/golang:1.10.4 as build
          WORKDIR /go/src/github.com/openfaas/faas/gateway
          
          #  RUN curl -sL https://github.com/alexellis/license-check/releases/download/0.1/license-check > /usr/bin/license-check && chmod +x /usr/bin/license-check
          
          COPY vendor         vendor
          
          COPY handlers       handlers
          COPY metrics        metrics
          COPY requests       requests
          COPY tests          tests
          
          COPY types          types
          COPY queue          queue
          COPY plugin         plugin
          COPY version        version
          COPY scaling        scaling
          COPY server.go      .
          
          #Run a gofmt and exclude all vendored code.
          #RUN license-check -path ./ --verbose=false \
          RUN GOARCH=s390x CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o gateway .
          
          FROM s390x/alpine:3.8
          
          RUN addgroup -S app \
            && adduser -S -g app app
          
          WORKDIR /home/app
          
          EXPOSE 8080
          EXPOSE 8082
          ENV http_proxy      ""
          ENV https_proxy     ""
          
          COPY --from=build /go/src/github.com/openfaas/faas/gateway/gateway    .
          COPY assets     assets
          
          RUN chown -R app:app ./
          
          USER app
          
          RUN sed -ie s/store.json/store-s390x.json/g /home/app/assets/script/funcstore.js
          
          CMD ["./gateway"]
          ```

	*   Build the image
        ```shell
        docker build -f Dockerfile.gate-s390x -t openfaas/gateway:0.13.4-s390x .
        ```

*  #### Build the image `openfaas/faas-swarm`

	*   Download the source code
           ```shell
		   go get -d github.com/openfaas/faas-swarm
           cd $GOPATH/src/github.com/openfaas/faas-swarm
           git checkout 0.6.2
		   ```
	*   Modify the `Dockerfile` 
           ```shell	
		   sed -i 's/RUN license-check/#RUN license-check/g' Dockerfile
		   sed -i 's/RUN curl -sL/#RUN curl -sL/g' Dockerfile
		   sed -i 's/    && chmod +x/#    && chmod +x/g' Dockerfile
		   ```
		   
	*   Build the image
           ```shell	   
		   docker build -f Dockerfile -t openfaas/faas-swarm:0.6.2-s390x .
           ```

*  #### Build the image `prom/prometheus`

	*   Download the source code
           ```shell
			cd $GOPATH/src/github.com
			mkdir -p Prometheus && cd Prometheus
			wget https://raw.githubusercontent.com/linux-on-ibm-z/dockerfile-examples/master/Prometheus/Dockerfile
		   ```
    *   Modify the `Dockerfile` as  below
		```diff
		--- Dockerfile  2019-06-07 06:59:06.372589452 +0000
		+++ Dockerfile.prom-s390x       2019-06-03 13:15:24.893720284 +0000
		@@ -54,5 +54,5 @@
		 #Export port
		 EXPOSE 9090
		 VOLUME [ "/prometheus" ]
		-
		+ENTRYPOINT [ "/prometheus/prometheus" ]
		 CMD prometheus --config.file=/etc/prometheus/prometheus.yml --web.console.libraries=/etc/prometheus/console_libraries --web.console.templates=/etc/prometheus/consoles
		```
	*   Build the image
           ```shell	   
			docker build -f Dockerfile -t prom/prometheus:v2.7.1-s390x .
		   ```



*  #### Build the image `openfaas/queue-worker`

	*   Download the source code
           ```shell
		   go get github.com/openfaas/nats-queue-worker 
		   cd $GOPATH/src/github.com/openfaas/nats-queue-worker
		   git checkout 0.7.2
		   ```
	*   Build the image
           ```shell	   
		   docker build -f Dockerfile -t openfaas/queue-worker:0.7.2-s390x .
		   ```


*  #### Build the image `prom/alertmanager`

	*   Download the source code
           ```shell
           go get github.com/prometheus/alertmanager
           cd $GOPATH/src/github.com/prometheus/alertmanager
           git checkout v0.16.2
		   ```
		   
	*   Create Dockerfile named `Dockerfile.s390x` with following content	 
        ```diff
		FROM        s390x/golang:1.11.4
		MAINTAINER  The Prometheus Authors <prometheus-developers@googlegroups.com>

		WORKDIR /go/src/github.com/prometheus/alertmanager
		COPY    . /go/src/github.com/prometheus/alertmanager

		RUN apt-get install make \
			&& make build \
			&& cp alertmanager /bin/ \
			&& mkdir -p /etc/alertmanager/template \
			&& mv ./doc/examples/simple.yml /etc/alertmanager/config.yml \
			&& rm -rf /go

		EXPOSE     9093
		VOLUME     [ "/alertmanager" ]
		WORKDIR    /alertmanager
		ENTRYPOINT [ "/bin/alertmanager" ]
		CMD        [ "-config.file=/etc/alertmanager/config.yml", \
					 "-storage.path=/alertmanager" ]
        ```
	*   Build the image
           ```shell	 
           docker build -f Dockerfile.s390x -t prom/alertmanager:v0.16.2-s390x .
           ```

*  #### Build the image `nats-streaming`

	*   Download the source code
           ```shell
		   go get github.com/nats-io/nats-streaming-server
		   cd $GOPATH/src/github.com/nats-io/nats-streaming-server
		   git checkout v0.11.2
		   ```
	*   Modify the `Dockerfile` as  below
		```shell 
		sed -i '/window/a RUN CGO_ENABLED=0 GOOS=linux   GOARCH=s390x go build -v -a -tags netgo -installsuffix netgo -ldflags "-s -w -X github.com/nats-io/nats-streaming-server/version.GITCOMMIT=`git rev-parse --short HEAD`" -o pkg/linux-s390x/nats-streaming-server && cp pkg/linux-s390x/nats-streaming-server /' Dockerfile
        ```
	*   Build the image
        ```shell	 		
		docker build -f Dockerfile -t nats-streaming:0.11.2-s390x .
		```


*  #### Build the `faas-cli` binary & `openfaas/faas-cli` image
	*   Download the source code
           ```shell
			cd $GOPATH/src/github.com/openfaas
			go get github.com/openfaas/faas-cli && cd faas-cli/
			git checkout 0.8.14
			go build
			cp faas-cli /usr/bin
           ```
	*   Modify the `Dockerfile` as  below

		```shell
		sed -i 's/RUN curl -sLSf/#RUN curl -sLSf/g' Dockerfile
		sed -i 's/RUN \/usr\/bin\/license-check/#RUN \/usr\/bin\/license-check/g' Dockerfile
		```
	*   Build the image
        ```shell	 	
		docker build -f Dockerfile -t openfaas/faas-cli:0.8.14-s390x .
		```   
		
*  #### Build the `watchdog` binary and `openfaas/classic-watchdog` image
	*   Download the source code
           ```shell
		   go get github.com/openfaas/faas/watchdog
		   cd $GOPATH/src/github.com/openfaas/faas/watchdog
		   git checkout tags/0.13.4

		   GOARCH=s390x CGO_ENABLED=0 GOOS=linux go build -a -ldflags "-s -w  -X main.GitCommit=$GIT_COMMIT -X main.Version=$VERSION" -installsuffix cgo -o watchdog . && cp watchdog /usr/bin/fwatchdog
		   ```
	*   Create Dockerfile named `Dockerfile.s390x` with following content	 
        ```diff		   
		FROM s390x/golang:1.10 as build

		ARG VERSION
		ARG GIT_COMMIT

		RUN mkdir -p /go/src/github.com/openfaas/faas/watchdog
		WORKDIR /go/src/github.com/openfaas/faas/watchdog

		COPY vendor                     vendor
		COPY metrics                    metrics
		COPY types                      types
		COPY main.go                    .
		COPY handler.go                         .
		COPY readconfig.go                  .
		COPY readconfig_test.go             .
		COPY requesthandler_test.go     .
		COPY version.go                 .

		# Run a gofmt and exclude all vendored code.
		RUN test -z "$(gofmt -l $(find . -type f -name '*.go' -not -path "./vendor/*"))"

		RUN go test -v ./...
		# Stripping via -ldflags "-s -w"
		RUN GOARCH=s390x CGO_ENABLED=0 GOOS=linux go build -a -ldflags "-s -w \
				-X main.GitCommit=$GIT_COMMIT \
				-X main.Version=$VERSION" \
				-installsuffix cgo -o watchdog . \
				&& cp watchdog /fwatchdog

        ```
	*   Build the image
        ```shell	
		docker build -f Dockerfile.s390x -t openfaas/classic-watchdog:0.13.4 .
		```

*  #### Build the `ofc-bootstrap` binary 

   ```shell
	go get -d github.com/openfaas-incubator/ofc-bootstrap
	cd $GOPATH/src/github.com/openfaas-incubator/ofc-bootstrap/
	git checkout 0.6.4
	go build
   ```

*  #### Build the image `openfaas/kafka-connector`
	*   Download the source code
           ```shell
			go get github.com/openfaas-incubator/kafka-connector
			cd $GOPATH/src/github.com/openfaas-incubator/kafka-connector
			git checkout 0.3.3
		```
	*   Build the image
           ```shell	
			docker build -f Dockerfile -t openfaas/kafka-connector:0.3.3-s390x .
	    ```

*  #### Build the image for `Tiller`
	*   Download the source code
	    ```shell
		go get -d github.com/helm/helm
		cd $GOPATH/src/github.com/helm/helm
		git checkout v2.13.1
		cd rootfs && wget https://storage.googleapis.com/kubernetes-helm/helm-v2.13.1-linux-s390x.tar.gz
		tar -xzvf helm-v2.13.1-linux-s390x.tar.gz && cp linux-s390x/tiller . && cp linux-s390x/helm .
        cp linux-s390x/helm /usr/bin
		rm -rf helm-v2.13.1-linux-s390x.tar.gz linux-s390x/
		```
	*   Build the image
        ```shell	
		docker build -f Dockerfile -t gcr.io/kubernetes-helm/tiller:v2.13.1 .
		```

*  #### Build the image `openfaas/faas-netes`
	*   Download the source code
           ```shell
			go get github.com/openfaas/faas-netes
			cd $GOPATH/src/github.com/openfaas/faas-netes
			git checkout 0.7.5
		   ```
	*   Modify the `Dockerfile` as  below

		```shell	   
		sed -i 's/RUN license-check/#RUN license-check/g' Dockerfile
		```
	*   Modify the 	`chart/kafka-connector/values.yaml` as below
		```shell	
		sed -i 's/0.3.3/0.3.3-s390x/g' chart/kafka-connector/values.yaml
		sed -i 's/0.7.3/0.7.5-s390x/g' chart/openfaas/values.yaml
		sed -i 's/Always/IfNotPresent/g' chart/openfaas/values.yaml
		sed -i 's/0.13.0/0.13.4-s390x/g' chart/openfaas/values.yaml
		sed -i 's/0.7.1/0.7.2-s390x/g' chart/openfaas/values.yaml
		sed -i 's/0.9.4/0.9.4-s390x/g' chart/openfaas/values.yaml
		sed -i 's/v2.7.1/v2.7.1-s390x/g' chart/openfaas/values.yaml
		sed -i 's/v0.16.1/v0.16.2-s390x/g' chart/openfaas/values.yaml
		sed -i 's/0.11.2/0.11.2-s390x/g' chart/openfaas/values.yaml
		sed -i 's/0.1.9/0.1.9-s390x/g' chart/openfaas/values.yaml
		```
		
	*   Modify the 	`chart/openfaas/templates/alertmanager-dep.yaml` as below
		```shell	
		sed -i  '/--spider/d' chart/openfaas/templates/alertmanager-dep.yaml
		```
		
	*   Modify the `chart/openfaas/templates/prometheus-dep.yaml` as below
		```shell			
		sed -i  '/--spider/d' chart/openfaas/templates/prometheus-dep.yaml
		```
    *   Package the openfaas and kafka-connector charts
		```shell
		cd chart/ 
		helm package openfaas/
		helm package kafka-connector/
		mv openfaas-3.2.3.tgz ../docs && mv kafka-connector-0.2.2.tgz ../docs && cd ../
		```
	*   Build the image
        ```shell	
		docker build -f Dockerfile -t openfaas/faas-netes:0.7.5-s390x .
		```


*  #### Build the image `openfaas/openfaas-operator`
	*   Download the source code
           ```shell
			go get github.com/openfaas-incubator/openfaas-operator
			cd $GOPATH/src/github.com/openfaas-incubator/openfaas-operator
			git checkout 0.9.4
		   ```
	*   Build the image
        ```shell	   
		docker build -f Dockerfile -t openfaas/openfaas-operator:0.9.4-s390x .
		```

*  #### Build the image `openfaas/faas-idler`
	*   Download the source code
           ```shell
			go get github.com/openfaas-incubator/faas-idler
			cd $GOPATH/src/github.com/openfaas-incubator/faas-idler
			git checkout 0.1.9
		   ```

	*   Create the patch `patch_idler` 
        ```diff
		diff --git a/main.go b/main.go
		index 35a4fc0..c703469 100644
		--- a/main.go
		+++ b/main.go
		@@ -42,15 +42,6 @@ func main() {

				credentials := Credentials{}

		-       client := &http.Client{}
		-       version, err := getVersion(client, config.GatewayURL, &credentials)
		-
		-       if err != nil {
		-               panic(err)
		-       }
		-
		-       log.Printf("Gateway version: %s, SHA: %s\n", version.Version.Release, version.Version.SHA)
		-
				val, err := readFile("/var/secrets/basic-auth-user")
				if err == nil {
						credentials.Username = val
		@@ -65,6 +56,15 @@ func main() {
						log.Printf("Unable to read password: %s", err)
				}

		+        client := &http.Client{}
		+        version, err := getVersion(client, config.GatewayURL, &credentials)
		+
		+        if err != nil {
		+                panic(err)
		+        }
		+
		+        log.Printf("Gateway version: %s, SHA: %s\n", version.Version.Release, version.Version.SHA)
		+
				fmt.Printf(`dry_run: %t
		 gateway_url: %s
		 inactivity_duration: %s `, dryRun, config.GatewayURL, config.InactivityDuration)
		```
		
	*   Apply the above patch to `main.go`
		```shell
		 patch --ignore-whitespace main.go patch_idler
		```
		
	*   Build the image
        ```shell	
		docker build -f Dockerfile -t openfaas/faas-idler:0.1.9-s390x .
		```

*  #### Build the image `minio/minio` 
	*   Download the source code
        ```shell
		go get -d github.com/minio/minio
		cd $GOPATH/src/github.com/minio/minio
		git checkout RELEASE.2019-05-14T23-57-45Z
		```
	*   Build the image
        ```shell		
		docker build -t minio/minio:RELEASE.2019-05-14T23-57-45Z .
        ```
		_**Note:** Docker build may hang while fetching/building Go modules.  You may want to kill the build process and start over again._
		
*  #### Build the image `minio/mc` for minion client

	*   Download the source code
	    ```shell
		go get -d github.com/minio/mc
		cd $GOPATH/src/github.com/minio/mc
		git checkout RELEASE.2019-05-01T23-27-44Z
		```
	*   Build the image
        ```shell				
		docker build -f Dockerfile -t minio/mc:RELEASE.2019-05-01T23-27-44Z .
		```

*  #### Build the image `quay.io/bitnami/sealed-secrets-controller`

   ```shell
	mkdir $SOURCE_ROOT/sealed-secrets
	cd $SOURCE_ROOT/sealed-secrets
   ```
	*   Create `Dockerfile` with following content.
        ```diff
		FROM golang:1.12-alpine
		RUN apk add --no-cache make git && go get github.com/bitnami-labs/sealed-secrets/cmd/kubeseal  \
			&&  cd src/github.com/bitnami-labs/sealed-secrets/ && git checkout v0.7.0 \
			&& make && chmod +x controller kubeseal \
			&& cp controller /usr/local/bin/ && cp kubeseal /usr/local/bin/

		EXPOSE 8080
		ENTRYPOINT ["controller"]
		```
	*   Build the image
        ```shell
		docker build -t quay.io/bitnami/sealed-secrets-controller:v0.7.0 .
		```

*  #### Build the image  `quay.io/kubernetes-ingress-controller/nginx-ingress-controller`
	*   Build the image
        ```shell
		cd $SOURCE_ROOT 

		mkdir nginx-ingress-controller && cd $SOURCE_ROOT/nginx-ingress-controller
		wget -q https://raw.githubusercontent.com/linux-on-ibm-z/scripts/master/NGINX-ingress-controller/0.24.1/build_nginx-ingress-controller.sh
		bash build_nginx-ingress-controller.sh -y
		docker tag quay.io/kubernetes-ingress-controller/nginx-ingress-controller-s390x:0.24.1 quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.24.1
		```

*  #### Build `kubeseal`

   ```shell
	go get -d github.com/bitnami-labs/sealed-secrets/cmd/kubeseal
	cd $GOPATH/src/github.com/bitnami-labs/sealed-secrets/cmd/kubeseal
	git checkout v0.7.0
	go build
	cp kubeseal /usr/bin/kubeseal
   ```

   _**Note:**  Warnings related to No GO files should be ignored._


*  #### Build the images `openfaas/edge-router` and `openfaas/of-builder`

   ```shell
	go get -d github.com/openfaas/openfaas-cloud
	cd $GOPATH/src/github.com/openfaas/openfaas-cloud
	git checkout 0.9.4
	cd edge-router && docker build -f Dockerfile -t openfaas/edge-router:0.6.1 .
	cd ../of-builder && docker build -f Dockerfile -t openfaas/of-builder:0.6.2 .
   ```
 
 _**Note:**  Warnings related to No GO files should be ignored._
 
 
*  #### Build the image `k8s.gcr.io/defaultbackend`
	*   Download the source code
	    ```shell
		go get -d github.com/kubernetes/ingress-gce
		cd $GOPATH/src/github.com/kubernetes/ingress-gce
		git checkout v1.5.0
		```
	*   Modify the `Dockerfile.404-server` as below:
		```shell
		sed -i 's/ARG_BIN/404-server/g' Dockerfile.404-server
		sed -i 's/ARG_ARCH/s390x/g' Dockerfile.404-server
		```
	*   Modify the 	`Makefile` as below:
		```shell
		sed -i 's/amd64/s390x/g' Makefile
        ```
    *  Build 
    	```shell
		make && cp .go/bin/404-server bin/s390x/
		```
	*   Build the image
        ```shell		
		docker build -f Dockerfile.404-server -t k8s.gcr.io/defaultbackend-amd64:1.5 .
		```
		_**Note:** Leave the tag as amd64 otherwise we need to create local helm charts._
		
	*   Build the image `openfaas/of-watchdog:0.5.3`
        ```shell
		go get github.com/openfaas-incubator/of-watchdog
		cd $GOPATH/src/github.com/openfaas-incubator/of-watchdog
		git checkout 0.5.3

		CGO_ENABLED=0 GOOS=linux go build -a -ldflags '-extldflags "-static"' -installsuffix cgo -o of-watchdog . && cp of-watchdog /usr/bin/of-watchdog	
        ```

	*   Create `Dockerfile.s390x` with below content

          ```shell
          
          FROM s390x/golang:1.10

          RUN mkdir -p /go/src/github.com/openfaas-incubator/of-watchdog
          WORKDIR /go/src/github.com/openfaas-incubator/of-watchdog

          COPY vendor              vendor
          COPY config              config
          COPY executor            executor
          COPY metrics             metrics
          COPY metrics             metrics
          COPY main.go             .

          # Run a gofmt and exclude all vendored code.
          #RUN test -z "$(gofmt -l $(find . -type f -name '*.go' -not -path "./vendor/*"))"

          #RUN go test -v ./...

          # Stripping via -ldflags "-s -w"
          RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags '-extldflags "-static"' -installsuffix cgo -o of-watchdog . \
              && cp of-watchdog /fwatchdog		
          ```		
	*   Build the image
        ```shell
		docker build -f Dockerfile.s390x -t openfaas/of-watchdog:0.5.3 .
        ```	
*  #### Build the `openfaas-fn` images

   _**Note:** These instructions assume that you have a Gitlab instance serving modified Templates compatible with s390x architecture.  These modifications to templates include replacing `openfaas/classic-watchdog:0.13.4` instances in Dockerfiles with s390x compiled `fwatchdog`.  In the below instructions replace the <git_URL> with your project instance eg. http://my.gitlab/username/s390xtemplates.git._   
	*   Build image `functions/of-git-tar`
		```shell
		cd $GOPATH/src/github.com/openfaas/openfaas-cloud/git-tar
		rm -rf template/
cp /usr/bin/faas-cli .
cp /usr/bin/fwatchdog .		
sed -i '4,6d' Dockerfile
sed -i '2iCOPY faas-cli /usr/local/bin/faas-cli' Dockerfile
sed -i '3iCOPY fwatchdog /usr/bin/fwatchdog' Dockerfile
		
	faas-cli build --image  functions/of-git-tar:0.12.2 --lang Dockerfile --handler . --name git-tars 
		```
	*   Build image `functions/of-buildshiprun`		
		```shell
		
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/buildshiprun
faas-cli build --image functions/of-buildshiprun:0.11.1 --lang go --handler . --name buildshiprun
```
	*   Build image `functions/github-event`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/github-event
faas-cli build --image functions/github-event:0.8.0 --lang go --handler . --name github-event
		
		```		
	*   Build image `functions/import-secrets`		
		```shell	
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/import-secrets
faas-cli build --image functions/import-secrets:0.3.3 --lang go --handler . --name import-secrets	
		```
	*   Build image `functions/system-metrics`		
		```shell

cd $GOPATH/src/github.com/openfaas/openfaas-cloud/system-metrics
faas-cli build --image functions/system-metrics:0.1.1 --lang go --handler . --name system-metrics		
   ```
		
	*   Build image `functions/github-status`		
		```shell	
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/github-status
faas-cli build --image functions/github-status:0.3.6 --lang go --handler . --name github-status
		```
	*   Build image `functions/garbage-collect`		
		```shell	
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/garbage-collect
faas-cli build --image functions/garbage-collect:0.4.4 --lang go --handler . --name garbage-collect	
    ```
	*   Build image `functions/pipeline-log:0.3.3`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/pipeline-log
faas-cli build --image  functions/pipeline-log:0.3.3 --lang go --handler . --name pipeline-log		
    ```
	*   Build image `functions/github-push`		
		```shell	
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/github-push
faas-cli build --image  functions/github-push:0.7.3 --lang go --handler . --name github-push		
		```
	*   Build image `functions/audit-event`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/audit-event
faas-cli build --image functions/audit-event:0.1.2 --lang go --handler . --name audit-event		
		```
	*   Build image `functions/list-functions`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/list-functions
faas-cli build --image functions/list-functions:0.4.7 --lang go --handler . --name list-functions
			
		```
		
	*   Build image `functions/of-cloud-dashboard`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/dashboard
make
faas-cli template pull https://github.com/openfaas-incubator/node10-express-template	
faas-cli build --image functions/of-cloud-dashboard:0.4.3 --lang node --handler . --name dashboard	
		```

	*   Build image `functions/gitlab-status`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/gitlab-status
faas-cli build --image functions/gitlab-status:0.1.1 --lang go --handler . --name gitlab-status		
		
		```

	*   Build image `functions/gitlab-push`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/gitlab-push
faas-cli build --image functions/gitlab-push:0.2.1 --lang go --handler . --name gitlab-push		
		```
		
	*   Build image `functions/gitlab-event`		
		```shell
cd $GOPATH/src/github.com/openfaas/openfaas-cloud/gitlab-event
faas-cli build --image functions/gitlab-event:0.1.2 --lang go --handler . --name gitlab-event		
		```
		
*  #### Build image `functions/alpine`		

   ```shell
	cd $GOPATH/src/github.com/openfaas/openfaas-cloud
	mkdir alpine && cd alpine && wget -q https://raw.githubusercontent.com/openfaas/faas/master/sample-functions/AlpineFunction/Dockerfile
	sed -i 's/0.14.4/0.13.4/g' Dockerfile
	docker build -f Dockerfile -t functions/alpine:latest .
	cd ../ && rm -rf alpine/
   ```   

*  #### Apply the bootstrap changes during deployment   

    ```shell
	cd $GOPATH/src/github.com/openfaas-incubator/ofc-bootstrap/
	sed -i 's/Always/IfNotPresent/g' templates/edge-auth-dep.yml
    ```
		
*  #### Update the ofc-bootstrap scripts

    ```shell
    cd $GOPATH/src/github.com/openfaas-incubator/ofc-bootstrap/
    ```
    _**Note:** If the patch fails use --ignore-whitespace option._
    

	*   Apply the below patch to  `scripts/deploy-cloud-components.sh`.
		```diff
		--- scripts/deploy-cloud-components.sh_orig	2019-07-08 10:51:46.268870198 +0000
        +++ scripts/deploy-cloud-components.sh	2019-07-08 10:52:21.891227857 +0000
        @@ -17,7 +17,7 @@
            kubectl apply -f ./tmp/openfaas-cloud/yaml/core/edge-router-dep.yml
         else
            #  Disable auth service by pointing the router at the echo function:
        -    sed s/auth.openfaas/echo.openfaas-fn/g ./tmp/openfaas-cloud/yaml/core/edge-router-dep.yml | kubectl    apply -f -
        +    sed 's/edge-auth.openfaas/echo.openfaas-fn/g' ./tmp/openfaas-cloud/yaml/core/edge-router-dep.yml |     kubectl apply -f -
         fi
         kubectl apply -f ./tmp/openfaas-cloud/yaml/core/edge-router-svc.yml
        
        @@ -66,7 +66,7 @@
         if [ "$GITLAB" = "true" ] ; then
            cp ../generated-gitlab.yml ./gitlab.yml
            echo "Deploying gitlab functions..."
        -    faas deploy -f ./gitlab.yml
        +    faas-cli deploy -f ./gitlab.yml
         fi
        
         cd ./dashboard
		```
		
	*  Apply the below patch to `scripts/clone-cloud-components.sh`		
		```diff
		diff --git a/scripts/clone-cloud-components.sh b/scripts/clone-cloud-components.sh
		index 781ed24..ef629a8 100755
		--- a/scripts/clone-cloud-components.sh
		+++ b/scripts/clone-cloud-components.sh
		@@ -7,3 +7,5 @@ git clone https://github.com/openfaas/openfaas-cloud ./tmp/openfaas-cloud
		 cd ./tmp/openfaas-cloud
		 echo "Checking out openfaas/openfaas-cloud@$TAG"
		 git checkout $TAG
		+sed -i 's/Always/IfNotPresent/g' yaml/core/edge-router-dep.yml
		+sed -i 's/Always/IfNotPresent/g' yaml/core/of-builder-dep.yml
		```
	*	Apply the below patch to `scripts/create-tiller.sh`
		```diff
		diff --git a/scripts/create-tiller.sh b/scripts/create-tiller.sh
		index 30b9623..fee4b55 100755
		--- a/scripts/create-tiller.sh
		+++ b/scripts/create-tiller.sh
		@@ -1,3 +1,2 @@
		 #!/bin/bash
		-
		-helm init --skip-refresh --upgrade --service-account tiller
		+helm init --skip-refresh  --service-account tiller
		```
	*	Apply the below patch to `scripts/export-sealed-secret-pubcert.sh`
		```diff
		diff --git a/scripts/export-sealed-secret-pubcert.sh b/scripts/export-sealed-secret-pubcert.sh
		index babee7d..a0793d8 100755
		--- a/scripts/export-sealed-secret-pubcert.sh
		+++ b/scripts/export-sealed-secret-pubcert.sh
		@@ -10,9 +10,13 @@ then
		 #    release=$(curl --silent "https://api.github.com/repos/bitnami-labs/sealed-secrets/releases/latest" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p')
			 echo "SealedSecrets release: $release"
		 
		-    curl -sLSf https://github.com/bitnami/sealed-secrets/releases/download/$release/kubeseal-$GOOS-$GOARCH > kubeseal && \
		-    chmod +x kubeseal
		+    #curl -sLSf https://github.com/bitnami/sealed-secrets/releases/download/$release/kubeseal-$GOOS-$GOARCH > kubeseal && \
		+    #chmod +x kubeseal
		+    go get -d github.com/bitnami-labs/sealed-secrets/cmd/kubeseal
		+    cd $GOPATH/src/github.com/bitnami-labs/sealed-secrets/cmd/kubeseal
		+    git checkout $release 
		+    go build
		 fi
		 
		-./kubeseal --fetch-cert --controller-name=ofc-sealedsecrets-sealed-secrets > tmp/pub-cert.pem && \
		-  cat tmp/pub-cert.pem
		+/usr/bin/kubeseal --fetch-cert --controller-name=ofc-sealedsecrets-sealed-secrets > tmp/pubcert.pem && \
		+  cat tmp/pubcert.pem
		```
	*	Apply the below patch to `scripts/install-openfaas.sh`
		```diff
		diff --git a/scripts/install-openfaas.sh b/scripts/install-openfaas.sh
		index a99504e..6b89fdc 100755
		--- a/scripts/install-openfaas.sh
		+++ b/scripts/install-openfaas.sh
		@@ -1,6 +1,6 @@
		 #!/bin/bash
		 
		-helm repo add openfaas https://openfaas.github.io/faas-netes
		+helm repo add openfaas http://127.0.0.1:8879/charts 
		 
		 helm repo update && \
		 helm upgrade openfaas --install openfaas/openfaas \
		 ```

   * Add the file `minio-sa.yml` in `ofc-bootstrap/scripts`
```shell
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: openfaas
  name: cloud-minio
```
  	*	Apply the below patch to `scripts/install-minio.sh`
```diff
@@ -3,6 +3,7 @@
 export ACCESS_KEY=$(kubectl get secret -n openfaas-fn s3-access-key -o jsonpath='{.data.s3-access-key}'| base64 --decode)
 export SECRET_KEY=$(kubectl get secret -n openfaas-fn s3-secret-key -o jsonpath='{.data.s3-secret-key}'| base64 --decode)

+kubectl apply -f $GOPATH/src/github.com/openfaas-incubator/ofc-bootstrap/scripts/minio-sa.yml
 helm install --name cloud-minio --namespace openfaas \
    --set accessKey="$ACCESS_KEY",secretKey="$SECRET_KEY",replicas=1,persistence.enabled=false,service.port=9000,service.type=NodePort \
   stable/minio
```


### Step 3:  Deploy OpenFaaS Cloud

*  #### Serve local helm chart
	```shell
	 cd $GOPATH/src/github.com/openfaas/faas-netes
	 helm repo index docs --url https://openfaas.github.io/faas-netes/ --merge ./docs/index.yaml
	 helm serve &
	```
	
*  #### Deploy OpenFaaS Cloud using ofc-bootstrap tool
     _**Note:**_
	_These guidelines supplement [ofc-bootstrap](https://github.com/openfaas-incubator/ofc-bootstrap) instructions._
	_Before you can deploy OpenFaas Cloud using ofc-bootstap make sure your environment is ready for deployment._
   
	* _Ensure you have a private Docker registry setup to hold OpenFaas functions deployed by the OpenFaas Cloud pipeline._
	* _Gitlab acount to host your OpenFaaS functions and appropriate Hooks to trigger the build._
	* _An internal server to serve required binaries and Helm charts for the installation_
	* _A DNS server as required by OpenFaas Cloud installation_
    
	_Once all the required images have been built by preceding steps and init.yaml file has been created as per_ _ofc-bootstarp [instructions](https://github.com/openfaas-incubator/ofc-bootstrap#create-your-own-inityaml), you can start the deployment as follows:_

	```shell 
	cd $GOPATH/src/github.com/openfaas-incubator/ofc-bootstrap/
	./ofc-bootstrap -yaml=init.yaml
	```

	## References:
	https://github.com/openfaas-incubator/ofc-bootstrap#create-your-own-inityaml

	https://github.com/openfaas/openfaas-cloud/blob/0.9.4/docs/GITLAB.md

	https://www.openfaas.com/blog/openfaas-cloud-gitlab/
