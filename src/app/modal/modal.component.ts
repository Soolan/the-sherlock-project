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
          let url = this.findInfoById(eventData[1].nodes[0])[0];
          (url.indexOf('http') !== -1)?
            window.open(url,'_blank'):
            console.log('This is root or a cluster center');
        }
      });

    this.visNetworkService.on(this.visNetwork, 'showPopup');
    this.visNetworkService.showPopup
      .subscribe((eventData: any[]) => {
        if (eventData[0] === this.visNetwork) {
          console.log('showPopup', eventData); //[networkId, nodeId]
          // let info = this.findInfoById(eventData[1]);
          // console.log('information:', info[0], info[1], info[2]);
          //
          // this.HoverInfoVisible = true;
          // document.getElementById('//*[@id="info"]').innerHTML =
          //   '<h4>Article size: info[2] words</h4>' +
          //   '<h5>link: info[0]</h5>'+
          //   '<span>info[1]</span>';
        }
      });

    this.visNetworkService.on(this.visNetwork, 'hoverNode');
    this.visNetworkService.hoverNode
      .subscribe((eventData: any[]) => {
        if (eventData[0] === this.visNetwork) {

        }
      });
  }

  findInfoById(id) {
    let nodes = this.visNetworkData.nodes;
    let i = (nodes as Array<any>).map(function (n) { return n.id; }).indexOf(id);
    return nodes[i].title;
  }

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
