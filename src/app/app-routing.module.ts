import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuardService } from "./core/guards/auth/auth-guard.service";
import { PovListComponent } from "./_components/pov-list/pov-list.component";

const routes: Routes = [
  {
    path: "login",
    loadChildren: () =>
      import("./features/login/login.module").then((m) => m.LoginModule),
  },
  {
    path: "dental",
    loadChildren: () =>
      import("./features/dashboard/dashboard.module").then(
        (m) => m.DashboardModule
      ),
    // canActivate: [AuthGuardService],
  },

  {
    path: "pov",
    // canActivate: [AuthGuard],
    component: PovListComponent,
  },

  {
    path: "",
    pathMatch: "full",
    redirectTo: "login", // change it to login page
  },
  {
    path: "**",
    pathMatch: "full",
    redirectTo: "login", // change it to page 404
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
