import {Component, OnInit} from '@angular/core';
import * as Vis from 'vis';
import { VisNetworkService } from 'ng2-vis/components/network';

@Component({
  selector: 'sh-modal',
  templateUrl: 'modal.html',
  styleUrls  : ['./app/evidence/modal.css']
})

export class ModalComponent{
  public ModalIsVisible: boolean;

  public visNetwork: string = 'networkId1';
  public visNetworkData: Vis.IData;
  public visNetworkOptions: Vis.IOptions;
  private visNetworkService: VisNetworkService;

  constructor (vns: VisNetworkService) {
    this.visNetworkService = vns;
    this.visNetworkOptions = {};

  }

  // ngOnInit () {
  //   this.visNetworkData= {
  //     nodes: [
  //       { id: '1', label: 'Node 1' },
  //       { id: '2', label: 'Node 2' },
  //       { id: '3', label: 'Node 3' },
  //       { id: '4', label: 'Node 4' },
  //       { id: '5', label: 'Node 5' }
  //     ],
  //     edges: [
  //       { from: '1', to: '3' },
  //       { from: '1', to: '2' },
  //       { from: '2', to: '4' },
  //       { from: '2', to: '5' }
  //     ]
  //   };
  //   this.visNetworkOptions = {};
  // }

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


  showModal()
  {
    // Promise.resolve(data).then(
    //   data => {
    //     console.log(data);
    //     this.visNetworkData = data;
    //   }
    // );

    this.ModalIsVisible = true;
  }

  hideModal()
  {
    this.ModalIsVisible = false;
  }
}
