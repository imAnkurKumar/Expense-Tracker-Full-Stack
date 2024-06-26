document.addEventListener("DOMContentLoaded", async () => {
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const buyPremiumButton = document.getElementById("buy-premium-button");
  let token;

  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  function showPremiumuserMember() {
    buyPremiumButton.style.visibility = "hidden";
    document.getElementById("message").innerHTML = "You are premium user";
    showLeaderboard();
  }
  try {
    token = localStorage.getItem("token");
    // console.log("token", token);
    const decodedToken = parseJwt(token);
    console.log(decodedToken);
    const isPremiumUser = decodedToken.isPremiumUser;
    if (isPremiumUser) {
      showPremiumuserMember();
    }

    if (!token) {
      console.error("token is missing");
    } else {
      const response = await axios.get(
        "http://localhost:4000/expense/getAllExpenses",
        { headers: { Authorization: token } }
      );
      const expenses = response.data;
      // console.log("expenses>>:", expenses);

      expenses.forEach((expense) => {
        const expenseItem = createExpenseItem(expense);
        // console.log("ExpenseItem", expenseItem);
        expenseList.appendChild(expenseItem);
      });
    }
  } catch (err) {
    console.log(err);
  }

  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    try {
      const response = await axios.post(
        "http://localhost:4000/expense/addExpenses",
        {
          amount,
          description,
          category,
        },
        { headers: { Authorization: token } }
      );

      // console.log("response from server", response.data.expense.id);
      if (response.status === 200) {
        const newExpense = {
          amount,
          description,
          category,
          id: response.data.expense.id,
        };
        const expenseItem = createExpenseItem(newExpense);

        expenseList.appendChild(expenseItem);

        document.getElementById("amount").value = "";
        document.getElementById("description").value = "";
        document.getElementById("category").value = "Food";

        alert("Expense added successfully");
      }
    } catch (error) {
      console.error("Expense addition error:", error);
      alert("Error adding expense");
    }
  });
  expenseList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-button")) {
      const expenseItem = e.target.parentElement;
      const expenseId = expenseItem.dataset.expenseId;
      console.log("expenseId>>:", expenseId);

      try {
        await axios.delete(
          `http://localhost:4000/expense/deleteExpense/${expenseId}`,
          { headers: { Authorization: token } }
        );
        expenseItem.remove();
        alert("Expense deleted successfully");
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Error deleting expense");
      }
    }
  });

  function createExpenseItem(expense) {
    const expenseItem = document.createElement("li");
    expenseItem.classList.add("expense-item");
    expenseItem.dataset.expenseId = expense.id;
    expenseItem.innerHTML = `
     <span class="amount">Rs ${expense.amount}</span>
     <span class="category">${expense.category}</span>
     <p class="description">${expense.description}</p>
     <button class="delete-button">Delete</button>
   `;
    // console.log("expenseItem>>>", expenseItem);
    return expenseItem;
  }
  function showLeaderboard() {
    const showLeaderboardButton = document.createElement("button");
    showLeaderboardButton.textContent = "Show Leaderboard";
    showLeaderboardButton.classList.add("show-leaderboard-button");

    showLeaderboardButton.addEventListener("click", () => {
      window.open("leaderboard.html", "_blank");
    });
    document.getElementById("message").appendChild(showLeaderboardButton);
  }

  buyPremiumButton.addEventListener("click", async (e) => {
    e.preventDefault();
    token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:4000/purchase/premiumMembership",
      { headers: { Authorization: token } }
    );
    // console.log(response);
    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        const res = await axios.post(
          "http://localhost:4000/purchase/updateTransactionstatus",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        );
        alert("You are a Premium User Now");
        buyPremiumButton.style.visibility = "hidden";
        document.getElementById("message").innerHTML = "You are premium user";
        localStorage.setItem("token", res.data.token);
        showLeaderboard();
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", async function (response) {
      console.log(response);
      alert("something went wrong");
    });
  });
});
