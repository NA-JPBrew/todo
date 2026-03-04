import Sidebar from "../components/Sidebar";
import TaskList from "../components/TaskList";

export default function App() {
  return (
    <div class="app-shell">
      <Sidebar />
      <TaskList />
    </div>
  );
}
