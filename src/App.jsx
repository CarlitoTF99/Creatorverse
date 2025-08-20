// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ShowCreators from "./pages/ShowCreators";
import ViewCreator from "./pages/ViewCreator";
import AddCreator from "./pages/AddCreator";
import EditCreator from "./pages/EditCreator";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<ShowCreators />} />
			<Route path="/add" element={<AddCreator />} />
			<Route path="/edit/:id" element={<EditCreator />} />
			<Route path="/view/:id" element={<ViewCreator />} />
			{/* fallback to home */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
