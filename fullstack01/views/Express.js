<form action="/post-crud" method="POST">
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="email" name="email"></input>
    </div>
    <div class="form-group col-md-6">
      <label for="inputPassword4">Password</label>
      <input
        type="password"
        class="form-control"
        id="password"
        name="password"
      ></input>
    </div>
  </div>
  <div class="form-group">
    <div class="form-group col-md-6">
      <label for="inputFirstName">First Name</label>
      <input
        type="text"
        class="form-control"
        id="firstName"
        name="firstName"
      ></input>
    </div>
    <div class="form-group col-md-6">
      <label for="inputLastName">Last Name</label>
      <input
        type="text"
        class="form-control"
        id="lastName"
        name="lastName"
      ></input>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group col-md-4">
      <label for="inputCity">Phone Number</label>
      <input
        type="text"
        class="form-control"
        id="phoneNumber"
        name="phoneNumber"
      ></input>
    </div>
    <div class="form-group col-md-4">
      <label for="inputState">Gender</label>
      <select type="text" class="form-control" id="gender" name="gender">
        <option selected value="0">
          Male
        </option>
        <option value="1">Female</option>
      </select>
    </div>
    <div class="form-group col-md-4">
      <label for="role">Role</label>
      <select type="text" class="form-control" id="role" name="role">
        <option selected value="1">
          Admin
        </option>
        <option value="2">Doctor</option>
        <option value="3">Patient</option>
      </select>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">
    Submit
  </button>
</form>;
