import {Component, OnInit} from '@angular/core';
import * as Vis from 'vis';
import { VisNetworkService } from 'ng2-vis/components/network';

@Component({
  selector: 'sh-modal',
  templateUrl: 'modal.html',
  styleUrls  : ['./app/modal/modal.css']
})

export class ModalComponent{
  public ModalIsVisible: boolean;

  public visNetwork: string = 'networkId1';
  public visNetworkData: Vis.IData;
  public visNetworkOptions: Vis.IOptions;
  public visNetworkService: VisNetworkService;

  constructor (vns: VisNetworkService) {
    this.visNetworkService = vns;
    this.visNetworkOptions = {interaction:{hover:true}};
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');

    // open your console/dev tools to see the click params
    this.visNetworkService.click
      .subscribe((eventData: any[]) => {
        if (eventData[0] === this.visNetwork) {
          console.log(eventData[1]);
        }
      });
  }

//   // create a network
//     [visNetwork]="visNetwork"
//     [visNetworkData]="visNetworkData"
//     [visNetworkOptions]="visNetworkOptions"
//     (initialized)="networkInitialized()

//   var container = document.getElementById('mynetwork');
//   var data = {
//   nodes: nodes,
//   edges: edges
// };
//   var options = {interaction:{hover:true}};
//   var network = new vis.Network(container, data, options);


  showModal(data)
  {
    this.visNetworkData = data;
    this.ModalIsVisible = true;
  }

  hideModal()
  {
    this.ModalIsVisible = false;
  }
}
