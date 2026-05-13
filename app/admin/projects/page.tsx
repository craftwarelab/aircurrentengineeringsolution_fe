'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { getProjects, addProject, updateProject, deleteProject, type Project } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    client: '',
    completionDate: '',
    scope: '',
    results: [] as string[],
  });
  const [newResult, setNewResult] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      industry: '',
      client: '',
      completionDate: '',
      scope: '',
      results: [],
    });
    setEditingProject(null);
    setNewResult('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProject) {
      const updated = updateProject(editingProject.id, formData);
      if (updated) {
        setProjects(projects.map(p => p.id === editingProject.id ? updated : p));
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
      }
    } else {
      const newProject = addProject(formData);
      setProjects([...projects, newProject]);
      toast({
        title: 'Success',
        description: 'Project added successfully',
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      industry: project.industry,
      client: project.client,
      completionDate: project.completionDate,
      scope: project.scope || '',
      results: project.results || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deleteProject(id)) {
      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    }
  };

  const addResult = () => {
    if (newResult.trim()) {
      setFormData({
        ...formData,
        results: [...formData.results, newResult.trim()],
      });
      setNewResult('');
    }
  };

  const removeResult = (index: number) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index),
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const industries = ['Commercial Real Estate', 'Healthcare', 'Manufacturing', 'Education', 'Hospitality'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="mt-2 text-gray-600">Manage your completed projects portfolio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update the project details below.' : 'Fill in the details for the new project.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="industry" className="text-right">
                    Industry
                  </Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="completionDate" className="text-right">
                    Completion Date
                  </Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="scope" className="text-right pt-2">
                    Scope
                  </Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="col-span-3"
                    rows={2}
                    placeholder="Project scope and deliverables"
                  />
                </div>

                {/* Results */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Results
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a result or achievement"
                        value={newResult}
                        onChange={(e) => setNewResult(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addResult} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {formData.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{result}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeResult(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingProject ? 'Update' : 'Add'} Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>A list of all your completed projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{project.industry}</Badge>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{new Date(project.completionDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}