import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  ngOnInit(): void {
    // Handle SSO callback logic here
    console.log('SSO callback processing...');
  }
}

