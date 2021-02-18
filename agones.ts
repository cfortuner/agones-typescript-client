import KubeClient from 'kubernetes-client'

const { KubeConfig } = require('kubernetes-client')
const Request = require('kubernetes-client/backends/request')

// extends kuberentes client and adds the agones CRDs
// https://github.com/godaddy/kubernetes-client

// agones crds https://agones.dev/site/docs/reference/agones_crd_api_reference/#agones.dev%2fv1

export class AgonesClient {
  kubeClient: KubeClient.ApiRoot

  constructor() {
    let backend
    if (process.env.NODE_ENV === 'production') {
      backend = new Request(Request.config.getInCluster())
    } else {
      const kubeconfig = new KubeConfig()
      kubeconfig.loadFromFile(process.env.KUBECONFIG_PATH)
      backend = new Request({ kubeconfig })
    }

    this.kubeClient = new KubeClient.Client1_13({ backend, version: '1.13' })
  }

  get apis() {
    return this.kubeClient.apis
  }

  static build = async () => {
    const client = new AgonesClient()

    // Get the agones custom resource definitions (CRDs)
    const res = await client.kubeClient.apis[
      'apiextensions.k8s.io'
    ].v1beta1.customresourcedefinitions.get()
    const agonesCRDs = res.body.items

    // Add the CRDs to the client
    // https://agones.dev/site/docs/reference/agones_crd_api_reference/
    agonesCRDs.forEach((crd: any) => {
      client.kubeClient.addCustomResourceDefinition(crd)
    })

    return client
  }

  // https://agones.dev/site/docs/reference/agones_crd_api_reference/#agones.dev%2fv1
  get agonesApi() {
    //@ts-ignore
    return this.apis['agones.dev'].v1
  }
  get allocationApi() {
    //@ts-ignore
    return this.apis
  }
  get autoscalingApi() {
    //@ts-ignore
    return this.apis['autoscaling.agones.dev'].v1
  }
  get multiclusterApi() {
    //@ts-ignore
    return this.apis['multicluster.agones.dev'].v1
  }

  get gameserverset() {
    return this.agonesApi.gameserverset
  }
  get gameserversets() {
    return this.agonesApi.gameserversets
  }
  get gameservers() {
    return this.agonesApi.gameservers
  }
  get gameserver() {
    return this.agonesApi.gameserver
  }
  get fleets() {
    return this.agonesApi.fleets
  }
  get fleet() {
    return this.agonesApi.fleet
  }
}
